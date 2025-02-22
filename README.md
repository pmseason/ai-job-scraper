# APM Season AI Job Search

Last Updated: February 3, 2025

## Introduction

This is an MVP of an AI-Powered Job Search. This is work in progress so the repository and code will be updated as it is used more and I get feedback.

## Table of Contents

- [Introduction](#introduction)
- [Installation](#installation)
- [Usage](#usage)
- [Features](#features)
  - [Data Sources](#data-sources)
- [Notes](#notes)
  - [How To Use](#how-to-use)
  - [Tip And Tricks](#tips-and-tricks)

## Installation

1. Clone the repository.
   ```bash
   git clone https://github.com/mrinal-c/apmszn-scraper.git
   ```
2. Open the repository in terminal and install the required packages.

   ```bash
   npm install
   ```

   or

   ```bash
    yarn
   ```

3. Create a `.env` file in the root directory and add the environment variables I sent you. An `.env.example` file is provided for reference.

## Usage

1. Read [Tips and Tricks](#tips-and-tricks) and [Configuration](#configuration) before using.
2. Create a configuration file in the root directory. You can use the `config.example.ts` file as a template.
3. Open a new terminal window. Quit your Chrome app if it is running. Then run the Chrome script using the following command:
   ```bash
   ./scripts/chrome.sh
   ```
4. Open a new terminal window (Separate from the Chrome process). Run the audit script using the following command:
   ```bash
   npm start
   ```
5. Check the terminal output for updates. All job listings will be saved in the results.json and results.csv files.

## Features

What does this script do? In short, it uses a combination of TWO data sources to scrape jobs across specific sites. As a user, you will have to just provide a configuration file that tells the script which companies to look for or where.

### Data Sources

1. **Scraping+AI**: I wrote custom scripts by analyzing each website by hand to navigate forms and pagination to retrieve job listings. Then, this raw data is passed to an OpenAI model to structure and filter out irrelevant results. I have only implemented a select list of companies/websites but this will grow.

2. **Firecrawl**: [Firecrawl](https://www.firecrawl.dev/) uses AI for scraping data, minimizing coding effort. Basically it does number 1 with the help of AI so it is way faster to implement as a dev. Note that it is new and may occasionally hallucinate or fail. I have found varying levels of success with it.

### Configuration

The `config.ts` file is used to configure the script. Check the example config file provided in `config.example.ts` It looks like this:

```javascript
//The config object is a list of search configurations --> SearchConfig[]
[
   {
      company: "linkedin",
      roleType: "apm",
      keyword: "product",
      source: "scraping+ai"
   }...
   //more search configs appear below
]

```

#### Config Properties

`SearchConfig` can be either `ScrapingSearchConfig` or `FirecrawlSearchConfig` based on the source.

#### `ScrapingSearchConfig`

```javascript
{
    keyword: string,
    source: "scraping+ai",
    roleType: "apm" | "internship",
    company: `CompanyName`,
    jobConditions?: string[]
}
```

| **Property**    | **Type**           | **Required** | **Description**                                                                                                                                                                                                                                                                                                                                                        |
| --------------- | ------------------ | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `keyword`       | `string`           | Yes          | The keyword to search. This is what would go into the search bar when you are visiting the site normally. Only `instacart`, `linkedin`, `tinder`, `walmart`, and `yahoo` support this, the other companies have no search bar on the website! They just have categorical filters, like "Product" jobs or something which I have prefilled to the appropriate category. |
| `source`        | `string`           | Yes          | Always `scraping+ai`.                                                                                                                                                                                                                                                                                                                                                  |
| `roleType`      | `string`           | Yes          | Either `apm` or `internship`.                                                                                                                                                                                                                                                                                                                                          |
| `company`       | `CompanyName`      | Yes          | One of `spotify`, `linkedin`, `kpcb`, `atlassian`, `instacart`, `walmart`, `figma`, `yahoo`, `tinder`, `cloudflare`                                                                                                                                                                                                                                                    |
| `jobConditions` | `array of strings` | No           | You can provide a list of conditions a job has to meet from this website to be included in the final results                                                                                                                                                                                                                                                           |

---

When running AI Filtering on OpenAI, we interface it like you would any other AI agent, with a prompt. The prompt has an overall message and various conditions that apply for a job to be valid. Below is how the prompt is structured:

```javascript
`You are an expert at structured data extraction. You will be given unstructured data from a job site audit and should filter it and convert it into the given structure. Here is the criteria for a valid job:`

[
  `Job CANNOT have 'senior' or any other word that implies more experience. We are looking for New Grad, Junior, Associate, and Entry Level roles`, //if role type == "apm"
  `Job CANNOT have 'senior' or any other word that implies more experience. We are looking for Internship and Fellowship Roles`, //if role type == "internship"
  "Job MUST be located Remote or in the United States of America."
]`;

```

Any strings you provide in `jobConditions` are appended to the end of this. Try putting it in `Job must/cannot/can ...` format for consistency.

##### `FirecrawlSearchConfig`

```javascript
{
      searchQuery: string,
      customQuery?: string
      url: string,
      roleType: "apm" | "internship",
      source: "firecrawl"
}
```

| **Property**  | **Type** | **Required** | **Description**                            |
| ------------- | -------- | ------------ | ------------------------------------------ |
| `searchQuery` | `string` | Yes          | The query for the search. See below        |
| `customQuery` | `string` | Yes          | The custom query for the search. See below |
| `url`         | `string` | Yes          | The target URL for the search.             |
| `roleType`    | `string` | Yes          | Either `apm` or `internship`               |
| `source`      | `string` | Yes          | Always `firecrawl`.                        |

---

When running on Firecrawl, we interface it like you would any other AI agent, with a prompt. Below is how the prompt is structured:

```javascript
`Extract all job positions related to ${searchQuery}. Include title and application link as required fields. Optionally include location, salary, visa, and description if available. Search across the first 3 pages of the site if possible.`;
```

Want to use a custom query of your own? Feel free to specify in the config. If you give a custom query, the search query field is ignored and you define evenrything in the custom query.

## Notes

### How To Use

The TLDR is:

- Auditing a company/website that appears on the list above? Use `scraping+ai`
  - For now, urls are predefined. All the current urls for `scraping+ai` companies are prefilled URLs for PRODUCT roles, like `https://www.atlassian.com/company/careers/all-jobs?team=Graduates&location=United%20States&search=` or `https://www.cloudflare.com/careers/jobs/?department=Product`. I am working on a way for a user to provide any url here and it will scrape
- Auditing literally anything else? Use `firecrawl`

The idea is that I have only hand-constructed a few websites for scraping, and this list will grow. You might wonder why we need to write this code when `firecrawl` seems like it will do it all. The reason is because `firecrawl` is still a little inconsistent, and there are still page complexities in the career websites we visit. I haven't found much success with like Linkedin and Hiring Cafe. So while `scraping+ai` takes a little longer to develop, it is the better option when it is available. If you find yourself firecrawling a certain website with minimal success, that is the time to reach out to me so I can get it implemented in scraping.

### Tips and Tricks

- **Read the Docs**: I try to be as detailed as possible, but I hope most answers are here! Reach out to me with anything else
- **Check for Updates**: Frequently pull to get the updated code -> there will be an automatic update notifier in slack whenever I update the code
- **Start Small**: Start with one or two searches to get yourself familiar with the configuration and flow of the script. The example has a bunch, so don't feel like you have to run all at once.
- **Incremental Audits**: Once again, you don't have to run 20 site audits at once. The results append to one another, not overwrite, so you can run 5-10 in succession and all results will be accumulated in the results files.
- **Test Out Websites**: Don't feed Firecrawl with URLs without visiting them yourself. Ensure data can easily be extracted from the website and is relevant. I don't think Firecrawl can fill out forms and navigate pages yet. Sites that work well
  - Are simple (Lever and Greenhouse job pages are beautiful - use them to test)
  - Don't have popups or many ads
  - Prefill form entries by having data in the URL: I don't think Firecrawl is too good at interacting with the page so `https://www.tesla.com/careers/search/?query=product&type=3&site=US` is way better than `https://www.tesla.com/careers/search`

### Vision

I know configuration and changing the code all the time seems like a lot of work for now, and yes it is more than what we want to do. This phase I view it as testing - this codebase is like a playground. Let's test it out, see what we like/don't like, and get a good flow for how to run audits.

### What's Next

- I am going to try to abstract things more from the user, so that you just have to provide a URL and ai/search query. Working on this currently
