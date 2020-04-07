from entsoe import EntsoeRawClient
from entsoe.exceptions import NoMatchingDataError
from bs4 import BeautifulSoup
import pandas as pd
import argparse
import xml.etree.ElementTree as ET
import xmltodict
import json
import datetime
import sys




dt = datetime.datetime.today()
day_ahead_dt = dt + datetime.timedelta(days = 1)
two_days_ahead_dt = dt + datetime.timedelta(days = 2)
parser = argparse.ArgumentParser()
parser.add_argument(
   '--country',
   help='Select the Country to generate the wholesale prices',
   required=True
   )

args = parser.parse_args()
#print(args.country)

countries   = ['Austria', 'Belgium', 'Bosnia and Herz.','Bulgaria','Croatia', 'Czech Republic', 'Denmark', 'Estonia', 'Finland',
              'France', 'Georgia', 'Germany', 'Greece', 'Hungary', 'Ireland', 'Italy','Latvia', 'Lithuania', 'Luxembourg', 'Netherlands',
              'North Macedonia', 'Norway', 'Poland', 'Portugal', 'Romania', 'Serbia', 'Slovakia','Slovenia', 'Spain', 'Sweden', 'Switzerland', 'UnitedKingdom']

countryCode = ['AT','BE','BA','BG','HR','CZ','DK','EE','FI','FR','GE', 'DE-LU', 'GR', 'HU', 'IE', 'IT',
               'LV', 'LT', 'LU', 'NL', 'MK', 'NO', 'PL', 'PT', 'RO', 'RS', 'SK', 'SI', 'ES', 'SE', 'CH', 'GB']

if args.country in countries :
   """
     Find the index of input country and determine the country code
   """
   country_code = countryCode[countries.index(args.country)]

#print(country_code)

client = EntsoeRawClient(api_key="9aea5cd9-99ff-44c2-a516-79156207af86")

# Start day: day before the day of interest
start = pd.Timestamp(year = day_ahead_dt.year, month=  day_ahead_dt.month, day= day_ahead_dt.day-1, tz='CET')

# End day: the day of interest
end = pd.Timestamp(year = two_days_ahead_dt.year, month = two_days_ahead_dt.month, day= two_days_ahead_dt.day, tz='CET')

# methods that return XML
#client.query_day_ahead_prices(country_code, start, end)

#xml_string = client.query_day_ahead_prices(country_code, start, end)
xml_string = client.query_day_ahead_prices(country_code, start, end)
# xml format
with open('wholesalePrices.xml', 'w') as f:
    f.write(xml_string)

# convert to json format
tree = ET.parse('wholesalePrices.xml')
root = tree.getroot()

xml_string = ET.tostring(root, encoding='utf8', method='xml')


final_json = json.dumps(xmltodict.parse(xml_string))
final_json = final_json.replace('ns0:','')
final_json = final_json.replace('price.amount','price')

y = json.loads(final_json)

with open('wholesalePrices.json', 'w', encoding='utf-8') as outfile:
    json.dump(y, outfile, ensure_ascii=True, indent=4)

json.dump(y, sys.stdout, indent=4)

# methods that return XML
#client.query_day_ahead_prices(country_code, start, end)
#client.query_load(country_code, start, end)
#client.query_load_forecast(country_code, start, end)
#client.query_wind_and_solar_forecast(country_code, start, end, psr_type=None)
#client.query_generation_forecast(country_code, start, end)
#client.query_generation(country_code, start, end, psr_type=None)
#client.query_installed_generation_capacity(country_code, start, end, psr_type=None)
#client.query_crossborder_flows(country_code_from, country_code_to, start, end)
#client.query_imbalance_prices(country_code, start, end, psr_type=None)

# methods that return ZIP
#client.query_unavailability_of_generation_units(country_code, start, end, docstatus=None)
#client.query_withdrawn_unavailability_of_generation_units(country_code, start, end)
