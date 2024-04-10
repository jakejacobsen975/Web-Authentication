import os, base64
class SessionStore:

    def __init__(self):
        # initialize data
        self.sessionData = {}
    def generateSession(self):
         # generate a large, random number for the session Id
        rnum = os.urandom(32)
        rstr = base64.b64encode(rnum).decode("utf-8")
        return rstr
    def createSession(self):
        sessionId = self.generateSession()
         # add a new session to the session store
        self.sessionData[sessionId] = {"session_id":sessionId}
        return sessionId
    def userlogin(self,sessionId,user_id):
        if sessionId in self.sessionData:
            # update the session data with user_id
            self.sessionData[sessionId]["user_id"] = user_id
            return self.sessionData[sessionId]
        return None
    def getSession(self, sessionId):
         # retrieve an wxisting session from the session store
        if sessionId in self.sessionData:
            return self.sessionData[sessionId]
