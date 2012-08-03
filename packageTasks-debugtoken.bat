cd "C:\dev\webworks\Tasks-tablet\bin\"
del Tasks.*

cd "C:\dev\webworks\Tasks-tablet\"
del "Tasks.zip"
zip -r Tasks.zip config.xml index.html icons html scripts stylesheet

cd "C:\Program Files\Research In Motion\BlackBerry WebWorks SDK for TabletOS 2.2.0.5\bbwp"
bbwp "C:\dev\webworks\Tasks-tablet\Tasks.zip" -d -o "C:\dev\webworks\Tasks-tablet\bin" >> c:\dev\webworks\Tasks-tablet\debugtoken-log.txt

cd "C:\Program Files\Research In Motion\BlackBerry WebWorks SDK for TabletOS 2.2.0.5\bbwp\blackberry-tablet-sdk\bin"
blackberry-deploy -installApp -password test -device 169.254.0.1 -password test -package "c:\dev\webworks\Tasks-tablet\bin\Tasks.bar" >> c:\dev\webworks\Tasks-tablet\debugtoken-log.txt


time /t
date /t

pause
