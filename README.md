###Motivation 


React app builder is a modified typescript create-react-app project directory. Instead of waiting for create-react-app to create a project directory every time I wanted to prototype or build a new website, I reorganized the folders to allow for compilation of multiple websites from the same directory. Note: the directory structure may be of interest, but cloning this entire repository is not likely to be helpful for you as it contains my own personal prototypes/applications in the src/apps/ directory.

Current projects within this repository include:

DreamCatcher (src/apps/dream_catcher/App.tsx):
A modern digital dream journal for recording your dreams using speech recognition.

MedKit (src/apps/medkit/App.tsx):
A toolkit for clinical decision support and medical education.

BinanceListener (src/apps/binance_listener/App.tsx):
A web interface that connects to a binance market data socket and plays beeps for buys and sells. Volume of the beep is proportional to volume of the trade, and the pitch goes up if its a buy and down if its a sell.

More to come!
This project was bootstrapped with Create React App.