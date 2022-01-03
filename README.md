# Overview

Fusion API doc. 

Written in [markdown](https://en.wikipedia.org/wiki/Markdown) using the [Slate](https://github.com/slatedocs/slate) doc format.

# Requirements 
* [Slate](https://github.com/slatedocs/slate) 2.3.1
* Linux / macOS (Windows supported using WSL2)
* Ruby > v2.3.1
* Bundler

# Getting started

Instructions below detail how to compile Slate using WSL2 & Ubuntu 20.04 LTS

## Installing dependencies 

* Install [WSL2](https://docs.microsoft.com/en-us/windows/wsl/install-win10) using Ubuntu distro 
* Run the commands below use _Bash on Ubuntu on Windows_ or [Windows Terminal](https://www.microsft.com/en-au/p/windows-terminal/9n0dx20hk701) 
  * `sudo apt-get update`
  * `sudo apt install make g++ zlibc zlib1g zlib1g-dev nodejs ruby-bundler ruby-full`
  * `sudo apt install ruby ruby-dev build-essential libffi-dev zlib1g-dev liblzma-dev nodejs patch`
  * `sudo gem update --system`
  * `sudo gem install bundler`
* Change to the documentation install directory e.g. Run `cd /mnt/c/Docs.UnifyCloudPOS/doc`
* Run `bundle install`


## Using slate

Update the page by editing markdown under `slate/source`.

Run `bundle exec middleman server` to start the [middleman](https://middlemanapp.com/) process. This will convert the site 
markdown to HTML on-the-fly each time you refresh the page. When you run middleman it will display the URL for your site, e.g. 
something like _http://127.0.0.1:4567_ (note: use 127.0.0.1 if you can't access the IP provided)

To build static HTML files for production deployment, run `bundle exec middleman build --clean`. Static HTML files will be exported to `slate/build`. 

Stylesheets be be edited under `source/stylesheets` 
* added extra ToC heading to 'all_nosearch.js' in the javascript folder to allow the search engine to include the new ToC heading

# Deploy

The Fusion docs are deployed using GitHub pages to [datameshgroup.github.io/fusion](https://datameshgroup.github.io/fusion). The pages source is configured ([here](https://github.com/datameshgroup/fusion/settings/pages)) to the [gh-pages](https://github.com/datameshgroup/fusion/tree/gh-pages) branch.

To deploy:
* Build source using `bundle exec middleman build --clean`
* Source will be written to the /source directory
* Update gh-pages branch with contents of /source


## Notes

Updated ToC as per https://github.com/slatedocs/slate/wiki/Deeper-Nesting

## Version History

### v1.0.0 ??

