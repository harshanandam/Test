import { LightningElement, api, wire, track } from 'lwc';

import getFieldsList from '@salesforce/apex/GenericDataTable_Nandam.getFieldsList';
import getDomainName from '@salesforce/apex/GenericDataTable.getDomainName';
// import UpdateRecord from '@salesforce/apex/GenericDataTable.UpdateRecord';
import { updateRecord } from 'lightning/uiRecordApi';
import { refreshApex } from '@salesforce/apex';
import DeleteRecord from '@salesforce/apex/GenericDataTable.DeleteRecord';
import updateUser from '@salesforce/apex/GenericDataTable.updateUser';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { getPicklistValuesByRecordType } from 'lightning/uiObjectInfoApi';
import customCss from '@salesforce/resourceUrl/custom_datatable';
import { loadStyle, loadScript } from 'lightning/platformResourceLoader';

import resetPasswordMethod from '@salesforce/apex/GenericDataTable.resetPasswordMethod';
import activateUsersListMethod from '@salesforce/apex/GenericDataTable.activateUsersListMethod';
import deactivateUsersListMethod from '@salesforce/apex/GenericDataTable.deactivateUsersListMethod';


const my_columns = [];
const sortLabels = [];


const actions = [
    { label: 'View', name: 'show_details' },
    { label: 'Edit', name: 'Edit' },
    { label: 'Delete', name: 'delete' },
    ];

export default class DynaTable extends LightningElement {

    @track sortBy = 'FirstName';
    @track sortDirection = 'asc';

    @track columns;
    @track sortingLabels;
    @api EnableSorting;
    @api EnableFlow=false;

    @api sObject = 'User';
    // this.sObject
    @api Fields = 'FirstName,LastName,Username,Email,isActive';
    // this.Fields
    @api LIMIT = '100';
    // this.LIMIT
    @track act_data;
    @api OrderBy = 'FirstName';
    @api FlowName = 'Flow';

    @track totalRecords;
    @track TotalPageNumbers;

    @track StartingRecord = '1';
    @track EndingRecord = '10';

    @track SearchText = '';

    @track value = '10';
    @track offset = 0;
    @track PageNumber = 1;
    @track isLoaded = false;

    @track ready = false;
    @track myurl;

    @track DisablePrevious = true;
    @track DisableFirst = true;
    @track DisabledLast;
    @track draftValues = [];
    @track error;

    wiredObjectResult;
    @track openmodel = false;

    @track ResultsData = {};

    @track FieldFilter = 'All';
    @track ProfileFilter = 'All Profiles';
    @track ActiveFilter = 'Active Users';

    @track SelectedUserIds = [];



@track devorg=false;
@track actvateuser=false;
@track deactivateuser=false;
@track ProcessedId;
@track UiResult;
@track actinguser;
@track deactinguser;
@track selectedlist;



    @track map = new Map();
    @track pageNo;
    @track selectedLength = 0;  //sum of map values + selectedName values

    @track new_load = false;

    @track data_checked = [];
    @track ids = [];
    @track selectedRows = [];
    @track prevResultLength = [];

    radioShowButton=true;
    ShowSelect = false;
    @track radiovalue = '';

    get radiooptions() {
        return [
            { label: 'Single User', value: 'Single' },
            { label: 'Multiple Users', value: 'Multiple' },
        ];
    }






    get filters() {
        return [
            { label: 'All', value: 'All' },
            { label: 'Name', value: 'Name' },
            { label: 'UserID', value: 'UserID' },
            { label: 'Email', value: 'Email' },
            { label: 'CompanyName', value: 'CompanyName' },
        ];
    }

    get profilefilters() {
        return [
            { label: 'All Profiles', value: 'All Profiles' },
            { label: 'Standard User', value: 'Standard User' },
            { label: 'System Administrator', value: 'System Administrator' },
        ];
    }

    get activeFilters() {
        return [
            { label: 'Active Users', value: 'Active Users' },
            { label: 'InActive User', value: 'InActive Users' },
        ];
    }
    openmodal() {
        this.openmodel = true
    }
    closeModal() {
        this.openmodel = false
    } 

    get options() {
        return [
            { label: '10', value: '10' },
            { label: '50', value: '50' },
            { label: '100', value: '100' },
        ];
    }

    handleChange(event) {
        this.value = event.detail.value;
        this.offset = 0;
        this.StartingRecord = '1';
        this.PageNumber = 1;
        this.EndingRecord = this.value;
        if(this.EndingRecord >= this.totalRecords){
            this.EndingRecord = this.totalRecords;
            this.DisableNext = true;
            this.DisabledLast = true;
        }
        if(this.EndingRecord <= this.totalRecords){
           // this.DisableNext = false;
        }
    }

    handleUserSelection(event){
        console.log('>> Test selection');
        if(this.radiovalue == 'Single'){

            this.ShowSelect = true;
        }
        if(this.radiovalue == 'Multiple'){
            this.ShowSelect = false;
        }
    }

    handleUpdateUsers(event) {
        const value = this.SelectedUserIds;
        // event.target.value

        const valueChangeEvent = new CustomEvent("valuechange", {
          detail: { value }
        });
        // Fire the custom event
        this.dispatchEvent(valueChangeEvent);
      }

    handleFieldChange(event){
        this.FieldFilter = event.detail.value;
    }

    handleProfileChange(event){
        this.ProfileFilter = event.detail.value;
    }

    handleActiveChange(event){
        this.ActiveFilter = event.detail.value;
    }

    handleMySave(Records){
        console.log('inside handle my save..Stringify'+ JSON.stringify(Records));
        console.log('inside handle my save..Records'+ Records);



        UpdateRecord({sObjectlistForUpdate : Records})
        .then(result => {
            console.log(result);
        })
        .catch(error => {
            console.log(JSON.stringify(error));
        });
    }

    handlesort(event) {
        this.sortBy = event.detail.value;
        this.OrderBy = event.detail.value;


    }

    handleNext(event) {
        this.DisablePrevious = false;
        this.offset = parseInt(this.offset) + parseInt(this.value);
        this.PageNumber = parseInt(this.PageNumber) + 1;
        this.StartingRecord = parseInt(this.StartingRecord) + parseInt(this.value);
        this.EndingRecord = parseInt(this.EndingRecord) + parseInt(this.value);
        if(this.totalRecords <= this.EndingRecord){
            this.EndingRecord = this.totalRecords;
            this.DisableNext = true;
        }
        if(this.totalRecords <= this.StartingRecord){
            this.StartingRecord = this.totalRecords;
        }
        this.isLoaded = false;
        
       // this.map.set(this.pageNo,this.ids);
        console.log('this.map from Next----->>>>>' +this.map);
        this.new_load = true;
        console.log('this.new_load----->>>>>>' +this.new_load);
        
}

@track overall_values = [];

    handleIds(){
        this.map.set(this.pageNo,this.ids);
        for (let [key, value] of this.map) {
            this.overall_values.push(value);
        }
        this.overall_values = this.overall_values.flat();
        this.overall_values = [...new Set(this.overall_values)];
        this.selectedRecords = this.overall_values;
        // console.log(JSON.stringify('overall values-*->'+this.overall_values));
        // you need to set overall_values array to be empty when reset/activate/deactivate actions are completed..
    }





    handlePrevious(event){
        if(parseInt(this.offset) !== 0){
        this.offset = parseInt(this.offset) - parseInt(this.value);
        this.StartingRecord = parseInt(this.StartingRecord) - parseInt(this.value);
        this.EndingRecord = parseInt(this.EndingRecord) - parseInt(this.value);
        this.isLoaded = false;
        }
        this.PageNumber = parseInt(this.PageNumber) - 1;
        
        if(parseInt(this.PageNumber) === 0){
            this.offset = 0;
            this.PageNumber = 1;

        }
        if(parseInt(this.PageNumber) === 1){
            this.DisablePrevious = true;
        }
        if(this.totalRecords >= this.EndingRecord){
            this.DisableNext = false;
        }
      //  this.map.set(this.pageNo,this.ids);
        this.new_load = true;

    }


    @wire (getDomainName) domainName;

    @wire (getFieldsList, {sobj : '$sObject', Fields : '$Fields', OrdBy : '$OrderBy',sortorder : '$sortDirection', SearchString : '$SearchText', LIM : '$value', offset : '$offset', FieldName : '$FieldFilter', ProfileFilter : '$ProfileFilter', ActiveFilter :'$ActiveFilter'}) FieldsList({data,error}){
        if(data){
            console.log('I am from Wire');
            var Fields = this.Fields;
            var arr = Fields.split(",");
            var FieldLabels = data.FieldLabels;
            var FieldTypes = data.FieldTypes;
            var Sel = data.Selected;

            this.totalRecords = data.RecordCount;
            this.TotalPageNumbers = Math.ceil(parseInt(this.totalRecords)/parseInt(this.value));

//            console.log('Value Defined in js------>>>>>' + this.value);
//            console.log('totalRecords----->>>>>>' +this.totalRecords);
//            console.log('Ending Record----->>>>>' + this.EndingRecord);

            this.act_data = data.FieldValueSobjectList;  
            this.isLoaded = true;

            for(let i=0;i<FieldLabels.length;i++){

                if(this.EnableSorting===true){
                let lab = {label : FieldLabels[i], fieldName : arr[i], type : FieldTypes[i], sortable: true, editable: true};
                    my_columns.push(lab);
                    console.log('label >>' + FieldLabels[i] + ' Field name >> '+ arr[i] + '>>> Field Type' +  FieldTypes[i]);
                } else if(this.EnableSorting===false){
                let lab = {label : FieldLabels[i], fieldName : arr[i], type : FieldTypes[i], sortable: false, editable: true};
                   my_columns.push(lab);
                   console.log('label >>' + FieldLabels[i] + ' Field name >> '+ arr[i] + '>>> Field Type' +  FieldTypes[i]);

                }

                }

                if(this.EnableFlow===true){
                let labFlow = {type: 'button', label: 'Open Flow', typeAttributes: {
                    label: 'view Details',
                    menuAlignment: 'right',
                    title: 'View Details',
                    name: 'viewDetails',
                    value: 'viewDetails',
                    variant: 'brand'
                }};
                my_columns.push(labFlow);
            }

            this.columns = my_columns;

            for(let i=0;i<FieldLabels.length;i++){
                let lab = {label : FieldLabels[i], value : arr[i]}
                sortLabels.push(lab);                
            }
            console.log('sortLabels------>>>>>' +sortLabels);
            this.sortingLabels = sortLabels;

            console.log('After Sorting Labels');

            console.log('Before Page No in Wire');
            this.pageNo = this.PageNumber; //--pageNo commented to check at 6:34pm 7th feb
            console.log('this.pageNo------>>>>>>' +this.pageNo);
            
            if(this.map.get(this.PageNumber) !== undefined){
                this.ids = this.map.get(this.PageNumber);
                console.log('this.ids------->>>>>>' +this.ids);
            }else{
                this.ids = [];
            }
            
            console.log('Pg Number----->>>>>>' +this.PageNumber);
            let sp_rec = this.map.get(this.PageNumber);
            console.log('sp_rec----->>>>>>' +sp_rec);
            this.selectedRows = sp_rec;

        }
        if(error){
            console.log(error);
        }

    }

    Search(event){
        this.SearchText = event.target.value;

//        console.log('SearchText------>>>>>' +this.SearchText);

        if(this.totalRecords < this.value){
//            console.log('Ending Record Should be made---->>>>>' + this.totalRecords);
            this.EndingRecord = parseInt(this.totalRecords);
        }

        if(this.totalRecords > this.value){
//            console.log('Total Records Great so Ending Record Should be---->>>>' +this.value);
            this.EndingRecord = parseInt(this.value);
        }


    }


    updateUserjs(event) {

        const recordInputs =  event.detail.draftValues.slice().map(draft => {
            const User = Object.assign({}, draft);
            return { User };
        });

        let myarraytoPass = [];
        
        for(let i=0; i<recordInputs.length; i++){
            myarraytoPass.push(recordInputs[i].User);
        }

        updateUser({use : myarraytoPass})
            .then( result => {
                this.dispatchEvent(
                     new ShowToastEvent({
                         title: 'Success',
                         message: 'Users Updated Succesfully',
                         variant: 'success'
                     })
                );
            })
            .catch((err) => {
                console.log("err->"+err+JSON.stringify(err));
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Fail',
                        message: err.body.message,
                        variant: 'error'
                    })
                )
            });

//            console.error(JSON.stringify(err))

    }























    getSelectedName(e) {
        console.log('Entered getSelectedName');
        var selected = e.detail.selectedRows;
        if(selected !== undefined && selected.length > 0){   
            let selectedIdsArray = [];
            for (let element of selected) {
                selectedIdsArray.push(element.Id);
            }
            this.ids = selectedIdsArray;
            this.pageNo = this.PageNumber;
            this.new_load = false;
        }else{
            if(this.map.has(this.PageNumber)){
                if(this.new_load === true){
                    if(this.map.get(this.PageNumber).length == 0){
                        this.new_load = false;
                        this.pageNo = this.PageNumber;
                        this.ids = this.map.get(this.PageNumber);
                    }
                    else if(this.map.get(this.PageNumber).length == 1){
                        this.pageNo = this.PageNumber;
                        this.ids = this.map.get(this.PageNumber);
                        this.new_load = false;
                        // if(this.prevResultLength[this.prevResultLength.length - 2] === 0){
                        //     this.ids = [];
                        // }
                        // else if(this.prevResultLength[this.prevResultLength.length - 2] === "null"){
                        //     this.ids = [];
                        // }
                    }else{
                        console.log('there are more than one record on previous and next actions checked on load and ids->'+this.ids+'-page number->'+this.PageNumber+'-map value->'+[...this.map]+'-new load test is->'+this.new_load);
                    }
                }
                else{
                    this.ids = [];
                    this.pageNo = this.PageNumber;
                    this.new_load = true;
                }
            }else{
                if(this.new_load === false){
                    this.ids = [];
                    this.pageNo = this.PageNumber;
                    this.new_load = true;
                }
                else{
                    console.log('*****************new load is true***************and ids->'+this.ids+'-page number->'+this.PageNumber+'-map value->'+[...this.map]+'-new load test is->'+this.new_load);
                }
            }

        }


        this.map.set(this.pageNo,this.ids);
        //this.selectedLength = this.ids.length;
        let unique_map_set = [];
        for (let [key, value] of this.map) {
            unique_map_set.push(value);
        }
        unique_map_set = unique_map_set.flat();
        console.log('unique_map_set----->>>>>' +unique_map_set);
        let ids_in_hand = this.ids;
        console.log('ids_in_hand----->>>>>' +ids_in_hand);
        let result_ar = ids_in_hand.concat(unique_map_set);
        console.log('result_ar------>>>>>' +result_ar);
        this.SelectedUserIds = unique_map_set;
        console.log('SelectedUserIds---->>>>' +this.SelectedUserIds);
        this.selectedLength = [...new Set(result_ar)].length;
    }

    clearSelection(){
        this.selectedRows = [];
        this.ids = [];
        this.map.clear();
    }

    getSelectedRow(event){ 
        var el =this.template.querySelector('lightning-datatable');
        var selected = el.getSelectedRows();
        this.scount= selected.length;
        let selectedIdsArray =[];
        let selectedNamesArray =[];
        for(let element of selected){
        //console.log('elementid', element.Id);
                    selectedIdsArray.push(element.Id);
                    selectedNamesArray.push(element.Name);
        }
        this.selectedlist = selectedNamesArray;
        console.log('selectedlist----->>>>>>'+this.selectedlist);
        this.selectedRecords = selectedIdsArray;
        console.log('selectedRecords----->>>>>>>' +selectedRecords);
    
    }


    resetPasswordForUser() {
        this.handleIds();
        console.log(this.selectedRecords);
        this.devorg =true;
        this.actvateuser =false;
        this.deactivateuser =false;
        console.log('Before entering method reset');
        resetPasswordMethod({lstUserIds : this.selectedRecords})
            .then(result =>{
                console.log('From result block');
                console.log(result);
                this.retrecact =result;
                this.count = result.length;
            })
            .catch((err) => {
                console.log('From Error block');
                console.log("err->"+err+JSON.stringify(err));
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Fail',
                        message: err.body.message,
                        variant: 'error'
                    })
                )
            });
            this.overall_values = [];
            this.selectedRecords = [];
            this.clearSelection();
        } 
        
        activateUsersList(){
            this.handleIds();
            console.log(this.selectedRecords);
            this.devorg =false;
        this.actvateuser =true;
        this.deactivateuser =false;
            activateUsersListMethod({activeUsers : this.selectedRecords})
            .then(result =>{
                console.log('Active success'+result);
                this.actinguser = result;
                this.actuser = result.length;
                })
                .catch((err) => {
                    console.log("err->"+err+JSON.stringify(err));
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'Fail',
                            message: err.body.message,
                            variant: 'error'
                        })
                    )
                });
                this.overall_values = [];
                this.selectedRecords = [];
                this.clearSelection();
        }
    
        deactivateUsersList(){
            this.handleIds();
            console.log(this.selectedRecords);
            this.devorg =false;
            this.actvateuser =false;
            this.deactivateuser =true;
        console.log('Entered Before Apex');
            deactivateUsersListMethod({deactiveUsers : this.selectedRecords})
            .then(result =>{
                console.log('Active success'+JSON.stringify(result) );
                console.log('Ids------->>>>>>>' + result.UserIds);
                this.deactinguser = result;
                this.deactuser = result.length;
                this.ProcessedId = result.UserIds;
               // this.UiResult = result;
               console.log("Ui----->>>>"+this.ProcessedId);
               if(result.UserIds.length>0){
                this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'Success',
                            message: 'Updated Ids:'+result.UserIds,
                            variant: 'success'
                        }))
                    }else {
                        this.dispatchEvent(
                            new ShowToastEvent({
                                title: 'Success',
                                message: 'Error:'+result.ErrorMessage,
                                variant: 'success'
                            }))
                    }
    
               
                });
               /* .catch((err) => {
                    console.log("err->"+err+JSON.stringify(err));
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'Error',
                            message:  result.ErrorMessage,
                            variant: 'Error'
                        })
                    )
                });*/
                this.overall_values = [];
                this.selectedRecords = [];
                this.clearSelection();
        }
    




    handleSave(event) {

//        console.log('From Handle Save');

        let ResultsData = this.FieldsList.data;

//        console.log(this.FieldsList.FieldLabels);

     
     
     /*   for(let i=0;i<FieldLabels.length;i++){

            const fieldsforUpdate = {};

            fieldsforUpdate[arr[i]] = event.detail.draftValues[i].arr[i];
            

            const recordInput = { fieldsforUpdate };

            console.log('recordInput From Update');
            console.log(recordInput);


        }
        
*/
        
    }










    handleSortdata(event){

        this.sortBy = event.detail.fieldName;
        this.sortDirection = event.detail.sortDirection;
        this.OrdBy = this.sortBy;
        this.OrderBy = this.sortBy;

    }

    LaunchFlow(event) {

        const action = event.detail.action;
    //    console.log('action New------>>>>>' + action);

        let row = event.detail.row;
        let currenRecordId= row.Id;
        let my_domain = this.domainName.data;



        switch (action.name) {

            case 'show_details':
                this.myurl = my_domain + '/' + currenRecordId;
                window.open(this.myurl);
                break;

            case 'Edit':
                this.myurl = my_domain + '/' + currenRecordId;
                this.openmodal();
                break;

            case 'delete':

                this.myDeleteRecord(currenRecordId);
                break;

            case 'viewDetails':
            let Flow_Name=this.FlowName;
            this.myurl = my_domain + '/flow/' + Flow_Name + '?recordId=' + currenRecordId;
            this.openmodal();

 }


 

 
    }




    handleCreateUser(event) {
        console.log('Please launch Flow');
        let my_domain = this.domainName.data;
        console.log('my_domain------>>>>>>' +my_domain);
        this.myurl = my_domain + '/flow/UserCreationFlow';
        this.openmodal(); 

    }

    

constructor(){
    super();
    if(this.LIMIT === undefined){
        this.LIMIT = "";
    }
    Promise.all([
        loadStyle(this, customCss)
    ]).then(result=>{
        // console.log('loaded successfully..from constructor');
    }).catch(error=>{
        console.log('Error Loading Static Resource------->>>>>>' +error);
    });
    this.new_load = true;
}


myDeleteRecord(recId){

    console.log('recId------>>>>>>>>' +recId);

    DeleteRecord({recordId : recId})
    .then(result => {
        console.log(result);
        return refreshApex(this.wiredObjectResult);
    })
    .catch(error => {
        console.log(JSON.stringify(error));
    });

}

 
   

}