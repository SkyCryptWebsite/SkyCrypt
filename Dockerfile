# Original Author of Code: Physanus
# Modified by: WarpWing
FROM ubuntu:18.04


RUN export DEBIAN_FRONTEND=noninteractive && \
    apt update && apt install -y \
    git tzdata npm bash python3

ENV TZ Europe/Berlin

WORKDIR /home/skyblock-stats
ADD files/skyblock-stats .

RUN ls -la

RUN sed -i 's/32464/80/g' src/app.js && \
    sed -i 's/32464/80/g' README.md && \
    npm install


ADD files/start.sh .
RUN chmod +x start.sh


EXPOSE 80

CMD ["/bin/bash", "-c", "/home/skyblock-stats/start.sh"]