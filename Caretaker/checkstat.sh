#!/bin/bash
##
# Website status check script
# Author: WarpWing
# Date: 08/26/2020
##


# Discord webhook
url="https://discordapp.com/api/webhooks/748009536261980176/1UHbLf7oegufvf9Q7NekZnCqEfGEgxkk5gAPuouPTjTjcpk7FJdkpBDbZYMj04K2nwLe"

websites_list="sky.shiiyu.moe"

for website in ${websites_list} ; do
        status_code=$(curl --write-out %{http_code} --silent --output /dev/null -L ${website})

        if [[ "$status_code" -ne 200 ]] ; then
            # POST request to Discord Webhook with the domain name and the HTTP status code
            curl -H "Content-Type: application/json" -X POST -d '{"content":"'"${domain} : ${status_code}"'"}'  $url
        else
            echo "${website} is running!"
        fi
done
