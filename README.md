# BetterTabs

BetterTabs is a smart browser extension that organizes your tabs by grouping using tags

## Features

- **Dynamic Grouping:**  
  Tabs are grouped based on last accessed time:
  - **Recent:** Accessed within the last hour.
  - **Old:** Not accessed for more than 5 days (auto-marked with a gray favicon).
  - **Standard:** All others.

- **Interactive Controls:**  
  Easily trigger functions like "Find Old Tabs" and "SortTabs" using the UI.

## Installation

1. **Clone the Repository:**
    ```bash
    git clone https://github.com/WanetsCode/BetterTabs-engine.git
    ```
    or go to
    https://wanets.me/projects/BetterTabs and dowload the folder
2. **Load in Chrome:**
    - Go to `chrome://extensions/`
    - Enable Developer Mode.
    - Click "Load unpacked" and select the `BetterTabs-engine` folder on your PC.

## Usage

- **Find Old Tabs:**  
  Click the **Find Old Tabs** button to mark tabs older than 5 days with a gray favicon.

- **Sort Tabs:**  
  Press the **SortTabs** button to group your tabs automatically.

- **Transfer/Import**  
  Easily Transfer your groups and tabs between PC's and accounts via a physical drive or a generated code

## API

After installation, return to this page. This text will be turned into API documentation with an API key generated specially for you! 

## Development

- **Tech Stack:**  
  Built using JavaScript, HTML, and CSS.
- **Manifest:**  
  Runs under Chrome Extensions Manifest V3.
- **APIs:**  
  Utilizes the `chrome.tabs` and `chrome.scripting` APIs for dynamic behavior.

## Contributing

Contributions are welcome!  
Feel free to open issues and submit pull requests to improve BetterTabs.

## License

This project is licensed under the GNUv3 License.
