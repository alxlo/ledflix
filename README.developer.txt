## Infos und Richtlinien für Entwickler

###  Ordnerstruktur: Wo finde ich was?

Und noch wichtiger: Wo tue ich was hin, wenn etwas hinzukommt?

* `README.developer.txt`
  This file.
* `mediasrc/`
  Quelldateien für Medien, z. B. Inkscape-Datei, aus der verwendete png-Images erzeugt werden.
* node_modules/
  n/r, If you don't know what this is, read a primer for node package management
* package.json
  n/r, see above
* public/
  Directory contents thats is served from our built-in-webserver. Divided into
  * public/css/
    everything CSS that is from us. No(!) vendor or 3rd party CSS! Stuff from us only.
  * public/html/
    HTML files and media files that are made by us.
  * public/js.3p/
    Javascript fragments or includes we copied from others, but only such stuff that is not 
    provided as vendor style libraries. E. g. a script that we found in some example or demo code,
    that is not distrubetd as a erd party library or is not available from such a library.
  * public/vendor/
    3rd party javascript libraries
* server.js
  Our built-in-webserver.
* workingnotes_ledball_ledflix.txt
  some random stuff, ignore this

