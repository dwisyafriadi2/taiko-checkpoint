import requests

# Define the target URL
url = "https://trailblazers.taiko.xyz/profile/0x1364D7E48ffD3F679bf654F22a70E1305b8D3Da3"

# Define a proxy (replace with a working proxy)
proxies = {
    "http": "353da1f0e416f535b500:2382214bb482dd8c@gw.dataimpulse.com:10474"
}

# Make a GET request to the website using the proxy
try:
    response = requests.get(url, proxies=proxies)
    if response.status_code == 200:
        print("Website content fetched successfully!")
        print(response.text)  # Print the page content
    else:
        print(f"Failed to access the site. Status code: {response.status_code}")
except requests.exceptions.RequestException as e:
    print(f"An error occurred: {e}")
