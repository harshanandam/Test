public class UserFieldClass {
    @AuraEnabled(cacheable=true)
    public static List<string> UserRequiredFields(){
        List<String> sObjList = new List<String>{'User'};
            List<String> customrequiredfields = new List<String>();
        Schema.DescribeSObjectResult[] descResult = Schema.describeSObjects(sObjList);
        Map<String, List<String>> objToRequiredFieldsMap = new Map<String, List<String>>();
        
        for(Schema.DescribeSObjectResult dsr : descResult){
            List<String> requiredFields = new List<String>();
            //get required fields
            Map<String, Schema.SObjectField> fieldMap = dsr.fields.getMap();
            for(String str : fieldMap.keySet()){
                Schema.DescribeFieldResult f = fieldMap.get(str).getDescribe();
                if(!f.isNillable() && f.isCustom()){
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
        return customrequiredfields;
    }
    
}