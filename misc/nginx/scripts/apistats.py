import requests
import json
res = json.loads(requests.get("https://api.hypixel.net/key?key=").text)
print("The owner of the API key is {api_key}".format(api_key=res["record"]["owner"]))
print("This key has been queried about {api_key} times".format(api_key=res["record"]["totalQueries"]))

