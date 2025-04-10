# Use Ubuntu base image
FROM ubuntu:22.04

# Install FFmpeg and AWS CLI
RUN apt-get update && \
    apt-get install -y ffmpeg curl unzip && \
    curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip" && \
    unzip awscliv2.zip && \
    ./aws/install

# Set working directory
WORKDIR /app

# Copy transcode script
COPY transcode.sh .

# Give it execution permission
RUN chmod +x transcode.sh

# Default command
ENTRYPOINT ["./transcode.sh"]
