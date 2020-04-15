public  class importdata {
    @AuraEnabled
    public static list<User> readCSVFile(Id idContentDocument, List<String> requiredFields){
        list<User> lstUserInsert = new list<User>();
        List<String> customrequiredfields = new List<String>();
        for(String fieldName : requiredFields){
            System.debug('From LWC' + fieldName);
        }
        if(idContentDocument != null) {
            
            
            ContentVersion objVersion = [SELECT Id, VersionData FROM ContentVersion WHERE ContentDocumentId =:idContentDocument];
            list<String> lstCSVLines = objVersion.VersionData.toString().split('\n');
            /*
            List<String> sObjList = new List<String>{'User'};
                
                Schema.DescribeSObjectResult[] descResult = Schema.describeSObjects(sObjList);
            Map<String, List<String>> objToRequiredFieldsMap = new Map<String, List<String>>();
            
            for(Schema.DescribeSObjectResult dsr : descResult){
                List<String> requiredFields = new List<String>();
                //get required fields
                Map<String, Schema.SObjectField> fieldMap = dsr.fields.getMap();
                for(String str : fieldMap.keySet()){
                    Schema.DescribeFieldResult f = fieldMap.get(str).getDescribe();
                    if(!f.isNillable()
                       && f.isCustom()){
                           requiredFields.add(f.getName());
                       }
                }
                objToRequiredFieldsMap.put(dsr.getName(), requiredFields);
            } 
            System.debug(objToRequiredFieldsMap);
            for(String str:objToRequiredFieldsMap.keyset())
            {
                System.debug('--'+objToRequiredFieldsMap.get(str).size());
                for(String str1:objToRequiredFieldsMap.get(str))
                {
                    system.debug('--'+str1);
                    customrequiredfields.add(str1);
                }   
            }
            
            system.debug('customrequiredfields------->>>>>>>' +customrequiredfields);
            system.debug('customrequiredfields.size----->>>>>' +customrequiredfields.size());
            
            */

            

            for(Integer i = 1; i < lstCSVLines.size(); i++){
                User objUsr = new User();
                
                list<String> csvRowData = lstCSVLines[i].split(',');
                System.debug('csvRowData====> '+csvRowData);
                objUsr.Username = csvRowData[0]; 
                objUsr.LastName = csvRowData[1];
                objUsr.Email = csvRowData[2];
                objUsr.Alias = csvRowData[3];
                objUsr.TimeZoneSidKey = csvRowData[4];
                objUsr.LocaleSidKey = csvRowData[5];
                objUsr.EmailEncodingKey = csvRowData[6];
                objUsr.ProfileID = csvRowData[7];
                objUsr.LanguageLocaleKey = csvRowData[8];
                
                system.debug('customrequiredfields---->>>>' +customrequiredfields);
                
                for(Integer j = 0; j <  requiredFields.size(); j++){                  
                   objUsr.put(requiredFields[j],csvRowData[9+j] );
                    
                }
                
                
                
                lstUserInsert.add(objUsr);
            }
            
            try{    
                if(!lstUserInsert.isEmpty()) {
                    //insert lstUserInsert;
                    Database.insert(lstUserInsert);
                }
            }
            catch (Exception ex) {
                throw new AuraHandledException(ex.getMessage());
            } 
        }
    return lstUserInsert;    
    }
}