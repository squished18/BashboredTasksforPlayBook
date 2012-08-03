cd "C:\dev\webworks\Tasks-tablet\bin\appworld\"
del Tasks.*

cd "C:\dev\webworks\Tasks-tablet\"
del "Tasks.zip"
zip -r Tasks.zip config.xml index.html icons html scripts stylesheet

cd "C:\Program Files\Research In Motion\BlackBerry WebWorks SDK for TabletOS 2.2.0.5\bbwp"
bbwp "C:\dev\webworks\Tasks-tablet\Tasks.zip" -g vicious1 -buildId 2 -o "C:\dev\webworks\Tasks-tablet\bin\appworld"

time /t
date /t

pause
