import { LightningElement,api,track,wire } from 'lwc';
import {ShowToastEvent} from 'lightning/platformShowToastEvent';
import readCSV  from '@salesforce/apex/importdata.readCSVFile';
import UserReqFields from '@salesforce/apex/UserReqFields.UserReqFields';
import Id from '@salesforce/user/Id';

export default class UploadMutliple extends LightningElement {
    @track data;
    @track mydata;
    @track loggedinuserId = Id;
    @track ShowRequiredFieldsBlock = false;
    @track msg;
    @track ShowButtonBlock = true;
    @track showUploadIcon =true

    
    @api msg;
    

    //myRecordId='0036F00002f9o4hQAA';

    @wire (UserReqFields) userFields({data,error}){
        if(data){
            console.log('on wire called');
            this.mydata= data;
            if(this.mydata.length > 0){
                this.ShowRequiredFieldsBlock = true;
            }
            
        }
        if(error){
            console.log('Error From User Fields------>>>>>' + JSON.stringify(error));
        }
    }
 
    get acceptedFormats() {

        return ['.csv'];

    }

    downloadCsv(event){
        console.log('ON click');
        var keys = ['Username','LastName','Email','Alias','TimeZoneSidKey','LocaleSidKey','EmailEncodingKey','ProfileID','LanguageLocaleKey'];
        var csvStringResult = keys.join(',');
        console.log('on Click');
        if(this.mydata.length >0){
            csvStringResult = csvStringResult +','+ this.mydata;
        }
        


        console.log('>>' + csvStringResult);
        console.log('Hello on Click Download');
        var hiddenElement = document.createElement('a');
          hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csvStringResult);
          hiddenElement.target = '_self'; // 
          hiddenElement.download = 'ExportData.csv';  // CSV file Name* you can change it.[only name not .csv] 
          document.body.appendChild(hiddenElement); // Required for FireFox browser
          hiddenElement.click(); // using click() js function to download csv file
          console.log('Hello after Anchor tag click');
    }

    handleUploadFinished(event) {

        // Get the list of uploaded files

        const uploadedFiles = event.detail.files;
        readCSV({idContentDocument : uploadedFiles[0].documentId, requiredFields : this.mydata}) 
        .then(result => {
            window.console.log('result ===> '+result);
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
           // this.msg=error.body.message;
        })
            
    
    }  
    


}