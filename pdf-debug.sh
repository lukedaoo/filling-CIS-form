#/bin/sh

file=$(find *.pdf | fzf)

java -jar debugger-app-3.0.3.jar $file
