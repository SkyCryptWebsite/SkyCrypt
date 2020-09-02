import requests
import json
res = json.loads(requests.get("https://api.hypixel.net/key?key=").text)
if res["success"] == True:
    print("The owner of the API key is {api_key}".format(api_key=res["record"]["owner"]))
    print("This key has been queried about {api_key} times".format(api_key=res["record"]["totalQueries"]))
    print("This key has a query limit of about {api_key}".format(api_key=res["record"]["limit"]))
    print("This key has been queried about {api_key} times in the past minute".format(api_key=res["record"]["queriesInPastMin"]))
else:
 print("API key invalid :(")