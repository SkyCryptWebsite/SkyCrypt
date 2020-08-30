import requests

res = requests.get("https://api.hypixel.net/key?key=1324402a-fbd1-4382-8008-411f8ecfad5f").json()
print("The owner of the API key is {key_owner}".format(key_owner=res["record"]["owner"]))
print("This key has been queried about {queries} times".format(queries=res["record"]["totalQueries"]))
print("This key has a query limit of about {api_limit}".format(api_limit=res["record"]["limit"]))
print("This key has been queried about {api_queries} times in the past minute".format(api_queries=res["record"]["queriesInPastMin"]))
#Note to self, build API Key false statement
