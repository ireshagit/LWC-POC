// import module elements
import {
    LightningElement,
    wire,
    track
} from 'lwc';

 
//import method from the Apex Class
import fetchEmployees from '@salesforce/apex/GetEmployeeDetails.fetchEmployees';


//import Delete function from salesforce api
import { deleteRecord } from 'lightning/uiRecordApi';

//import api functions from salesforce
//import { refreshApex } from '@salesforce/apex';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { reduceErrors } from 'c/ldsUtils';
import { CurrentPageReference } from 'lightning/navigation';
import { fireEvent } from 'c/pubsub';
import { registerListener, unregisterAllListeners } from 'c/pubsub';
import { refreshApex } from '@salesforce/apex';


// Declaring the columns in the datatable
const columns = [{
        label: '',
        type: 'button-icon',
        initialWidth: 75,
        typeAttributes: {
            iconName: 'action:preview',
            title: 'Preview',
            variant: 'border-filled',
            alternativeText: 'View'
        }
    },
    {
        label: 'First Name',
        fieldName: 'First_Name__c'
    },
    {
        label: 'Last Name',
        fieldName: 'Last_Name__c'
    },
    {
        label: 'Phone',
        fieldName: 'Phone__c'
    }

];
 
// declare class to expose the component
export default class EmployeeDataTable extends LightningElement {
    @track columns = columns;
    @track record = {};
    @track rowOffset = 0;
    @track data = {};
    @track bShowModal = false;
    @track empRecordID;
    @wire(fetchEmployees) parameters;
    @wire(CurrentPageReference) pageRef;
 
    connectedCallback() {
        // subscribe(register) to bearListUpdate event
        registerListener('refreshEmp', this.refreshEmployeeRecords, this);
        registerListener('EmployeeListUpdate', this.handlechange, this);
    }
    disconnectedCallback() {
        // unsubscrib(unregister) from bearListUpdate event
        unregisterAllListeners(this);
    }
    
    refreshEmployeeRecords(recordInput){
        this.recordInput = recordInput;
        return refreshApex(this.parameters);
    }

    handlechange(evt){
        this.evt = evt;
        // eslint-disable-next-line no-console
        console.log ('Handle change ' + this.evt);

        return refreshApex(this.parameters);
            
    }

    // Row Action event to show the details of the record
    handleRowAction(event) {
        const row = event.detail.row;
        this.record = row;
        this.bShowModal = true; // display modal window

    }
    
    // to close modal window set 'bShowModal' tarck value as false
    closeModal() {
        this.bShowModal = false;
    }
    
    //  delete the Related Contact Record
    deleteContact(event) {
        const contactId = event.target.dataset.recordid;
        // Show Toast at Record Delete
        deleteRecord(contactId)
            .then(() => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Record Deleted',
                        variant: 'success'
                    })
                );
                fireEvent(this.pageRef, 'EmployeeListUpdate', event);
                this.bShowModal = false;

            })

            //Show error when record does not deleted
            .catch(error => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error deleting record',
                        message: reduceErrors(error).join(', '),
                        variant: 'error'
                    })
                );
            });
    }
    //Update employee record
    updateEmployee(event){
        this.empRecordID = event.target.dataset.recordid;
       /*eslint-disable no-console */
         console.log('getid '+this.empRecordID);
        this.retrieveUpdateEmployee();
    }

    retrieveUpdateEmployee(){
        this.closeModal();
        fireEvent(this.pageRef, 'updateEmployeeEvent',this.empRecordID);
        /*eslint-disable no-console */
        console.log('fireEvent '+this.empRecordID);
    }


}