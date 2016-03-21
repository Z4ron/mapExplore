import webapp2
from google.appengine.ext import ndb

MAIN_PAGE_HTML = """\
<!DOCTYPE html>
<html ng-app="Illustrations" ng-controller="MainCtrl as control" ng-init="control.getData()">
  <head>
    <link rel="stylesheet" href="css/bootstrap.css" />
    <link rel="stylesheet" href="css/layout.css" />
    <script src="js/jquery-2.1.1.js"></script>
    <script src="js/bootstrap.js"></script>
    <script src="js/angular.js"></script>
    <script src="js/app.js"></script>
  </head>
  <body>
    <div class="sidebar">
        <h4>Options</h4>
        <span class="mapTitle">Current Map: {{mapName}}</span>
        <button class="btn btn-success changeMapButton" ng-click="control.changeMap(mapName)">Change Map</button>
        <span class="username">Current User: {{username}}</span>

        <label class="editModeLabel"><input id="editMode" type="checkbox" ng-click="toggleEditMode()"></input>Edit Mode</label>
    </div>

    <div id="mapArea" class="mapArea" ng-click="control.placeButton(e)">
        <div id="infoPanel" class="infoPanel">
            <div id="infoTitle" class="infoTitle" contenteditable="false" spellcheck="false"></div>
            <div id="infoContent" class="infoContent" contenteditable="false" spellcheck="false"></div>
            <button class="btn btn-info" ng-click="saveButton()">Save</button>
            <button class="btn btn-success" ng-click="closeInfoPanel()">Close</button>
            <button class="btn btn-danger" ng-click="deleteButton()">Delete</button>
        </div>
    </div>
  </body>
</html>
"""

# Model for storing map information
class MapModel(ndb.Model):
    content = ndb.StringProperty(indexed=False)
    date = ndb.DateTimeProperty(auto_now_add=True)

class MainPage(webapp2.RequestHandler):
    def get(self):
    	self.response.headers.add_header("Access-Control-Allow-Origin", "*")
        self.response.write(MAIN_PAGE_HTML)

class InfoPage(webapp2.RequestHandler):
    def get(self):
        self.response.headers.add_header("Access-Control-Allow-Origin", "*")
        mapModel = MapModel.get_by_id(self.request.get('Map'))
        self.response.write(mapModel.content)

class WritePage(webapp2.RequestHandler):
    def post(self):
    	self.response.headers.add_header("Access-Control-Allow-Origin", "*")
    	self.response.headers['Content-Type'] = 'text/plain'

    	# Retrieve map from datastore if it exists, else create a new one
        if MapModel.get_by_id(self.request.get('Map')):
        	newMap = MapModel.get_by_id(self.request.get('Map'))
        else:
            newMap = MapModel(id=self.request.get('Map'))

        newMap.content = self.request.body
        newMap.put()
        

application = webapp2.WSGIApplication([
    ('/', MainPage),
    ('/info', InfoPage),
    ('/write', WritePage)
], debug=True)