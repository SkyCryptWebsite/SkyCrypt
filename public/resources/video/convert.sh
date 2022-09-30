#!/bin/bash
ffmpeg -i enable-api-original.mp4 -vf scale=1920:-1 -an enable-api.webm -vf scale=1920:-1 -an enable-api.mp4