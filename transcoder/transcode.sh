#!/bin/bash

set -e

VIDEO_URL="$1"
FILENAME="input.mp4"
OUTPUT_DIR="output"

echo "🔽 Downloading video from S3..."
curl -o $FILENAME "$VIDEO_URL"

mkdir -p $OUTPUT_DIR

echo "🎬 Transcoding to multiple HLS resolutions..."

# 144p
ffmpeg -i $FILENAME -vf "scale=-2:144" -c:a aac -b:a 64k -c:v h264 -crf 28 -g 48 -hls_time 5 -hls_playlist_type vod \
  -hls_segment_filename "$OUTPUT_DIR/144p_%03d.ts" "$OUTPUT_DIR/144p.m3u8"

# 240p
ffmpeg -i $FILENAME -vf "scale=-2:240" -c:a aac -b:a 64k -c:v h264 -crf 26 -g 48 -hls_time 5 -hls_playlist_type vod \
  -hls_segment_filename "$OUTPUT_DIR/240p_%03d.ts" "$OUTPUT_DIR/240p.m3u8"

# 360p
ffmpeg -i $FILENAME -vf "scale=-2:360" -c:a aac -b:a 96k -c:v h264 -crf 24 -g 48 -hls_time 5 -hls_playlist_type vod \
  -hls_segment_filename "$OUTPUT_DIR/360p_%03d.ts" "$OUTPUT_DIR/360p.m3u8"

# 480p
ffmpeg -i $FILENAME -vf "scale=-2:480" -c:a aac -b:a 128k -c:v h264 -crf 22 -g 48 -hls_time 5 -hls_playlist_type vod \
  -hls_segment_filename "$OUTPUT_DIR/480p_%03d.ts" "$OUTPUT_DIR/480p.m3u8"

# 720p
ffmpeg -i $FILENAME -vf "scale=-2:720" -c:a aac -b:a 128k -c:v h264 -crf 20 -g 48 -hls_time 5 -hls_playlist_type vod \
  -hls_segment_filename "$OUTPUT_DIR/720p_%03d.ts" "$OUTPUT_DIR/720p.m3u8"

# 📄 Create master playlist
echo "#EXTM3U" > $OUTPUT_DIR/master.m3u8
echo "#EXT-X-VERSION:3" >> $OUTPUT_DIR/master.m3u8
echo "#EXT-X-STREAM-INF:BANDWIDTH=300000,RESOLUTION=256x144" >> $OUTPUT_DIR/master.m3u8
echo "144p.m3u8" >> $OUTPUT_DIR/master.m3u8
echo "#EXT-X-STREAM-INF:BANDWIDTH=500000,RESOLUTION=426x240" >> $OUTPUT_DIR/master.m3u8
echo "240p.m3u8" >> $OUTPUT_DIR/master.m3u8
echo "#EXT-X-STREAM-INF:BANDWIDTH=800000,RESOLUTION=640x360" >> $OUTPUT_DIR/master.m3u8
echo "360p.m3u8" >> $OUTPUT_DIR/master.m3u8
echo "#EXT-X-STREAM-INF:BANDWIDTH=1400000,RESOLUTION=854x480" >> $OUTPUT_DIR/master.m3u8
echo "480p.m3u8" >> $OUTPUT_DIR/master.m3u8
echo "#EXT-X-STREAM-INF:BANDWIDTH=2800000,RESOLUTION=1280x720" >> $OUTPUT_DIR/master.m3u8
echo "720p.m3u8" >> $OUTPUT_DIR/master.m3u8

echo "☁️ Uploading HLS output to S3..."

aws s3 cp output/ "s3://$AWS_BUCKET_NAME/hls-output/$VIDEO_FILENAME/" --recursive --no-guess-mime-type --content-type "application/vnd.apple.mpegurl"

echo "✅ Done! Access the HLS master playlist at:"
echo "https://$AWS_BUCKET_NAME.s3.$AWS_REGION.amazonaws.com/hls-output/${VIDEO_URL##*/}/master.m3u8"
