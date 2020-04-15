public with sharing class GenericDataTable_Nandam {
    @AuraEnabled(cacheable=true)
    Public static QueryDetails getFieldsList(String sobj, String Fields, String OrdBy, String sortorder,String SearchString, Integer LIM, Integer offset, String FieldName, String ProfileFilter, String ActiveFilter) {


        VisibleProfiles__mdt[] visibleProfiles = [SELECT MasterLabel, Not_To_Be_Seen__c  FROM VisibleProfiles__mdt];

        system.debug('visibleProfiles------->>>>>' +visibleProfiles);


        String ObjType = sobj;
        Map<String, Schema.SObjectType> schemaMap = Schema.getGlobalDescribe();
        Schema.SObjectType objectSchema = schemaMap.get(ObjType);
        Map<String, Schema.SObjectField> fieldMap = objectSchema.getDescribe().fields.getMap();

        List<String> IndividualFields = Fields.split(',');

        List<String> FLs = new List<String>();
        List<String> FTs = new List<String>();
        String SearchStringForQuery = '';

        for(String s : IndividualFields) {
        FLs.add(fieldMap.get(s).getDescribe().getLabel());
        FTs.add(String.Valueof(fieldMap.get(s).getDescribe().getType()).toLowercase());
        SearchStringForQuery += s + ' Like \'' +'%'+ String.escapeSingleQuotes(SearchString) +'%\'' + ' OR ';
        system.debug('>>> FTs & FLs' + fieldMap.get(s).getDescribe().getLabel() + ' ' + String.Valueof(fieldMap.get(s).getDescribe().getType()).toLowercase());
        }

        SearchStringForQuery = SearchStringForQuery.left(SearchStringForQuery.length()-4);

    String Query = 'Select ' + Fields + ' From ' + sobj;
    String CountQuery1 = 'Select count(id) RecCount From ' + sobj; 
    System.debug('>>>' +SearchString);
    if(ActiveFilter == 'Active Users' && SearchString == ''){
        Query += ' WHERE isActive = true ';
        CountQuery1 += ' WHERE isActive = true ';
    }
    if(ActiveFilter == 'InActive Users' && SearchString == ''){
        Query +=' WHERE isActive = false ';
        CountQuery1 += ' WHERE isActive = false ';

    }
    system.debug('test');

    if(SearchString != '' || FieldName != 'All' || ProfileFilter != 'All Profiles'){
       // Query += ' AND ';
       // CountQuery1 += ' Where ';
    }

    if(SearchString != '' && FieldName == 'All' && ProfileFilter == 'All Profiles'){
        Query += 'AND ' + SearchStringForQuery;
        CountQuery1 += 'AND ' +SearchStringForQuery;
    }




    if(FieldName != 'All' && SearchString != ''){
        Query += 'AND ' +FieldName + ' Like \'' +'%'+ String.escapeSingleQuotes(SearchString) +'%\''; 
        CountQuery1 += 'AND ' +FieldName + ' Like \'' +'%'+ String.escapeSingleQuotes(SearchString) +'%\'';
    }


    if(ProfileFilter != 'All Profiles' && SearchString == ''){
        Query += 'AND' +' Profile.Name ' + ' Like \'' +'%'+ String.escapeSingleQuotes(ProfileFilter) +'%\'';
        CountQuery1 += 'AND' +' Profile.Name ' + ' Like \'' +'%'+ String.escapeSingleQuotes(ProfileFilter) +'%\'';
    }

    if(ProfileFilter != 'All Profiles' && SearchString != ''){
        Query += 'AND ' +'(' + SearchStringForQuery + ') AND (Profile.Name ' + ' Like \'' +'%'+ String.escapeSingleQuotes(ProfileFilter) +'%\')';
        CountQuery1 +='AND ' + '(' + SearchStringForQuery + ') AND (Profile.Name ' + ' Like \'' +'%'+ String.escapeSingleQuotes(ProfileFilter) +'%\')';
    }

    if(OrdBy != null && sortorder != null){
        Query = Query + ' ORDER BY ' + OrdBy + ' ' + sortorder;
    }

    Query += ' LIMIT ' + LIM + ' offset ' + offset;

    system.debug('Query------>>>>>' + Query);

    String CountQuery = 'Select count(Id) RecCount From ' + sobj;

    


    List<sObject> sObjectCount = Database.query(CountQuery);

    List<sObject> sObjectCount1 = Database.query(CountQuery1);

    System.debug('sObjectCount1------->>>>>>>>>' +sObjectCount1);

            Integer sCount;

        for(sObject so : sObjectCount1){
            sCount = (Integer) so.get('RecCount');
        }

    List<sObject> sObjectList = Database.query(Query);
    List<User> UserObjectList = Database.query(Query);
    for(User u : UserObjectList){
        System.debug('User record' +u);
    }
    QueryDetails QD = new QueryDetails(FLS,FTS,sObjectList,sCount);
        
        return QD;
    }

    @AuraEnabled(Cacheable=true)
    public static String getDomainName(){
    String URL = URL.getSalesforceBaseUrl().toExternalForm();
    return URL;
    }

    @AuraEnabled
    Public static String DeleteRecord(String recordId){

    system.debug(recordId);

    try{
    Database.delete(recordId);
        } catch (Exception e){
            system.debug(e.getMessage());
        }



        return null;
    }


    @AuraEnabled
    public static void updateUser(list<User> use) {

        try {
        Database.update(use, false);
        system.debug('I am from the try Block');
        } catch(Exception e){
            system.debug('Error Message From catch----->>>>>' + e.getMessage());
                throw new AuraHandledException(e.getMessage());
        }

}

    Public class QueryDetails {
        @AuraEnabled
        public List<String> FieldLabels {get;set;}
        @AuraEnabled
        Public List<String> FieldTypes {get;set;}
        @AuraEnabled
        Public List<sObject> FieldValueSobjectList {get;set;}
        @AuraEnabled 
        Public Integer RecordCount {get;set;}
        @AuraEnabled
        Public Boolean Selected {get;set;}

        Public QueryDetails(List<String> Lbls, List<String> Types, List<sObject> FieldValLst, Integer RecCount){
            this.FieldLabels = Lbls;
            this.FieldTypes = Types;
            this.FieldValueSobjectList = FieldValLst;
            this.RecordCount = RecCount;
            Selected = true;
        }

    }

Public class DeactivateUserWrapper{
@AuraEnabled
public List<Id> UserIds{get;set;}
@AuraEnabled
public List<String> ErrorMessage {get;set;}


Public DeactivateUserWrapper(List<Id> uIds,List<String> Emessage){
    this.UserIds         = uIds;
    this.ErrorMessage    = Emessage;
}
}

Public class activateUserWrapper{
    @AuraEnabled
    public List<Id> actUserIds{get;set;}
    @AuraEnabled
    public List<String> actErrMessage {get;set;}
    
    
    Public activateUserWrapper(List<Id> uactIds,List<String> actEmessage){
        this.actUserIds         = uactIds;
        this.actErrMessage    = actEmessage;
    }
    }


    Public class ReserWrapper{
        @AuraEnabled
        public List<Id> resetId{get;set;}
        @AuraEnabled
        public List<String> resetError {get;set;}
        
        
        Public ReserWrapper(List<Id> Ids,List<String> RsetMessage){
            this.resetId         = Ids;
            this.resetError    = RsetMessage;
        }
        }

@AuraEnabled
public static DeactivateUserWrapper deactivateUsersListMethod(List<String> deactiveUsers){
system.debug('deactiveUsers Ids Start---->>>>>>'+deactiveUsers);
list<user> deactiveUserslist = [select id, name,isactive,isportalenabled from user where ID IN :deactiveUsers];
List<id> Activateduser = new List<id>();
list<string> MessageErr = new list<string>();
List<User> deuserUpdateList = new List<User>();

for(User u : deactiveUserslist)
{
if(u.isActive==True){
u.isActive = false;
deuserUpdateList.add(u); 

}
try{
Database.SaveResult[] srList = Database.update(deuserUpdateList, false);
for (Database.SaveResult sr : srList) {
if (sr.isSuccess()) {
   
    Activateduser.add(sr.getId());
}
else {
                  
    for(Database.Error err : sr.getErrors()) {
      
        MessageErr.add(err.getMessage());
        }
}
}
}
Catch(Exception e){
system.debug(e);
}

}
DeactivateUserWrapper abc = new DeactivateUserWrapper(Activateduser,MessageErr);
return abc;
}

@AuraEnabled
public static ReserWrapper resetPasswordMethod(List<String> lstUserIds){
    system.debug('Ids From Reset Password----->>>>>' +lstUserIds);
list<user> userslistId = [select id, name,isactive,isportalenabled from user where ID IN :lstUserIds];
List<id> resetuser = new List<id>();
list<string> resetMessageErr = new list<string>();
list<User> listrec = new list<User>();
for(User u : userslistId)
{
if(u.isActive == true){

    System.resetPassword(u.id,true);
    listrec.add(u); 
    
    }
    try{
    Database.SaveResult[] srList = Database.update(listrec, false);
    for (Database.SaveResult sr : srList) {
    if (sr.isSuccess()) {
       
        resetuser.add(sr.getId());
    }
    else {
                      
        for(Database.Error err : sr.getErrors()) {
            
            resetMessageErr.add(err.getMessage());
            }
    }
    }
    }
    Catch(Exception e){
    system.debug(e);
    }
    
    }
    ReserWrapper abc1 = new ReserWrapper(resetuser,resetMessageErr);
    return abc1;
    }


@AuraEnabled
public static activateUserWrapper activateUsersListMethod(List<String> activeUsers){
    system.debug('User Ids In Activate----->>>>>>' +activeUsers);
list<user> activeUserslist = [select id, name,isactive,isportalenabled from user where ID IN :activeUsers];

List<id> actvuser = new List<id>();
List<User> userUpdateList = new List<User>();
list<string> actingUsers = new list<string>();
for(User u : activeUserslist)
{
if(u.isActive==false){
    u.isActive = true;
    userUpdateList.add(u); 
    }
    try{
    Database.SaveResult[] srList = Database.update(userUpdateList, false);
    for (Database.SaveResult sr : srList) {
    if (sr.isSuccess()) {
        actvuser.add(sr.getId());
    }
    else {
                      
        for(Database.Error err : sr.getErrors()) {
            actingUsers.add(err.getMessage());
            }
    }
    }
    }
    Catch(Exception e){
    system.debug(e);
    }
    
    }
    activateUserWrapper abc2 = new activateUserWrapper(actvuser,actingUsers);
    return abc2;
    }

}