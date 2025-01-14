#/bin/sh

file=$(find . -mindepth 1 -maxdepth 1 -type d | fzf)

java -jar debugger-app-3.0.3.jar $file
