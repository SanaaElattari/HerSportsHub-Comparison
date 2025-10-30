import requests
import pandas as pd
from bs4 import BeautifulSoup
import warnings

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

all_defense = []

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
    print(f"Scraping defensive stats for {team_name}...")

    #response = requests.get(url, headers={"User-Agent": "Mozilla/5.0"})
    response = requests.get(url, headers=headers)
    if response.status_code != 200:
        print(f"❌ Failed to retrieve {team_name}: {response.status_code}")
        continue

    soup = BeautifulSoup(response.text, "html.parser")

    # Defensive stats table
    defense_table = soup.find("table", id=lambda x: x and "stats_defense" in x)
    
    if not defense_table:
        print(f"⚠️ No defensive stats table found for {team_name}")
        continue

    df = pd.read_html(str(defense_table))[0]

    # Flatten multi-level headers
    df.columns = ['_'.join(col).strip() if isinstance(col, tuple) else col for col in df.columns]

    # Drop duplicate header rows if exist
    if "Rk_Rk" in df.columns:
        df = df[df["Rk_Rk"] != "Rk"]

    # Add team column
    df["Team"] = team_name

    all_defense.append(df)

if all_defense:
    defense_df = pd.concat(all_defense, ignore_index=True)
    print(defense_df.head())

    defense_df.to_csv("nwsl_defense_2025.csv", index=False)
    print("✅ Saved defensive stats to nwsl_defense_2025.csv")
else:
    print("❌ No defensive data scraped.")
