import requests
import pandas as pd
from bs4 import BeautifulSoup
import warnings
import time
import random

warnings.simplefilter(action='ignore', category=FutureWarning)

team_urls = {
    "Seattle Reign FC": "https://fbref.com/en/squads/257fad2b/Seattle-Reign-FC-Stats",
    "Portland Thorns": "https://fbref.com/en/squads/df9a10a1/Portland-Thorns-FC-Stats",
    "Washington Spirit": "https://fbref.com/en/squads/e442aad0/Washington-Spirit-Stats",
    "KC Current": "https://fbref.com/en/squads/6f666306/Kansas-City-Current-Stats",
    "San Diego Wave": "https://fbref.com/en/squads/bf961da0/San-Diego-Wave-Stats",
    "Orlando Pride": "https://fbref.com/en/squads/2a6178ac/Orlando-Pride-Stats",
    "Racing Louisville": "https://fbref.com/en/squads/da19ebd1/Racing-Louisville-Stats",
    "Gotham FC": "https://fbref.com/en/squads/8e306dc6/Gotham-FC-Stats",
    "North Carolina Courage": "https://fbref.com/en/squads/85c458aa/North-Carolina-Courage-Stats",
    "Angel City FC": "https://fbref.com/en/squads/ae38d267/Angel-City-FC-Stats",
    "Houston Dash": "https://fbref.com/en/squads/e813709a/Houston-Dash-Stats",
    "Bay FC": "https://fbref.com/en/squads/231a532f/Bay-FC-Stats",
    "Chicago Red Stars": "https://fbref.com/en/squads/d976a235/Chicago-Red-Stars-Stats",
    "Utah Royals FC": "https://fbref.com/en/squads/d4c130bc/Utah-Royals-Stats"
}

all_players = []

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                  "AppleWebKit/537.36 (KHTML, like Gecko) "
                  "Chrome/127.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
    "Referer": "https://www.google.com/",
    "DNT": "1",
    "Connection": "keep-alive",
    "Upgrade-Insecure-Requests": "1",
}


for team_name, url in team_urls.items():
    print(f"Scraping {team_name}...")

    #response = requests.get(url, headers={"User-Agent": "Mozilla/5.0"})
    response = requests.get(url, headers=headers)

    if response.status_code != 200:
        print(f"❌ Failed to retrieve {team_name}: {response.status_code}")
        continue

    soup = BeautifulSoup(response.text, "html.parser")

    standard_table = soup.find("table", id=lambda x: x and "stats_standard" in x)

    if not standard_table:
        print(f"⚠️ No standard stats table found for {team_name}")
        continue

    df = pd.read_html(str(standard_table))[0]

    # Flatten multi-level headers
    df.columns = ['_'.join(col).strip() if isinstance(col, tuple) else col for col in df.columns]

    # If "Rk" exists, drop duplicate header rows
    if "Rk_Rk" in df.columns:
        df = df[df["Rk_Rk"] != "Rk"]

    # Add team name
    df["Team"] = team_name

    all_players.append(df)

    delay = random.uniform(2, 5)
    print(f"⏳ Sleeping for {delay:.1f} seconds...")
    time.sleep(delay)

if all_players:
    players_df = pd.concat(all_players, ignore_index=True)
    print(players_df.head())

    players_df.to_csv("nwsl_players_2025.csv", index=False)
    print("✅ Saved player stats to nwsl_players_2025.csv")
else:
    print("❌ No player data scraped.")
