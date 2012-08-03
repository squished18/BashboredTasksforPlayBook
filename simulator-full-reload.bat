simulator-removeTasks.bat

cd "C:\dev\webworks\Tasks-tablet\bin\"
del Tasks.*

cd "C:\dev\webworks\Tasks-tablet\"
del "Tasks.zip"
zip -r Tasks.zip config.xml index.html icons html scripts stylesheet

cd "C:\Program Files\Research In Motion\BlackBerry WebWorks SDK for TabletOS 2.2.0.5\bbwp"
bbwp "C:\dev\webworks\Tasks-tablet\Tasks.zip" -d -o "C:\dev\webworks\Tasks-tablet\bin"

cd "C:\Program Files\Research In Motion\BlackBerry WebWorks SDK for TabletOS 2.2.0.5\bbwp\blackberry-tablet-sdk\bin"

blackberry-deploy -installApp -device 192.168.158.129 -package "C:\dev\webworks\Tasks-tablet\bin\Tasks.bar"

pause
