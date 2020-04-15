import { LightningElement, track,wire,api } from 'lwc';
import {ShowToastEvent} from 'lightning/platformShowToastEvent';
import readCSV  from '@salesforce/apex/importdata.readCSVFile';
import UserReqFields from '@salesforce/apex/UserFieldClass.UserRequiredFields';

export default class SampleComponent extends LightningElement {
    @track ShowRequiredFieldsBlock= true;
    @track myFields;
    @api myRecordId='0052w000002MUJQ';

    get acceptedFormats() {
        return ['.csv'];
    }

    handleUploadFinished(event){
        const uploadedFiles = event.detail.files;
        console.log('>>> '+ uploadedFiles[0].name);
    }

    handleUploadFinished(event) {

        // Get the list of uploaded files

        const uploadedFiles = event.detail.files;
        readCSV({idContentDocument : uploadedFiles[0].documentId, requiredFields : this.myFields}) 
        .then(result => {
            console.log('result ===> '+result);
            this.data = result;
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success!!',
                    message: 'Users are created based CSV file!!!',
                    variant: 'success',
                }),
            );
            
        })
        .catch(error => {
            console.log('Error when uploading-----------'+JSON.stringify(error.body.message) );
            this.error = error;
            //this.error = error.body.message;
            //alert('Please update the invalid form entries and try again.');
             this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error!!',
                    message: error.body.message,
                    variant: 'error',
                }),
            );    
        })
            
    
    }  

    @wire (UserReqFields) userFields({data,error}){
        if(data){
            console.log('on wire called');
            this.myFields= data;
            if(this.myFields.length > 0){
                this.ShowRequiredFieldsBlock = true;
            }
            
        }
        if(error){
            console.log('Error From User Fields------>>>>>' + JSON.stringify(error));
        }
    }
    handleClick(event){
            console.log('ON click');
            var keys = ['Username','LastName','Email','Alias','TimeZoneSidKey','LocaleSidKey','EmailEncodingKey','ProfileID','LanguageLocaleKey'];
            var csvStringResult = keys.join(',');
            console.log('on Click');
            console.log('>>' + csvStringResult);
            if(this.myFields.length > 0){
                csvStringResult = csvStringResult + ',' +this.myFields;
            }
            
            var hiddenElement = document.createElement('a');
              hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csvStringResult);
              hiddenElement.target = '_self'; // 
              hiddenElement.download = 'ExportData.csv';  // CSV file Name* you can change it.[only name not .csv] 
              document.body.appendChild(hiddenElement); // Required for FireFox browser
              hiddenElement.click(); // using click() js function to download csv file
              console.log('Hello after Anchor tag click');
        }
}