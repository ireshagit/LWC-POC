import { LightningElement,track, wire,api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { updateRecord } from 'lightning/uiRecordApi';
import getSingleEmployee from '@salesforce/apex/GetEmployeeDetails.getSingleEmployee';
import FIRSTNAME_FIELD from '@salesforce/schema/Employee__c.First_Name__c';
import LASTNAME_FIELD from '@salesforce/schema/Employee__c.Last_Name__c';
import PHONE_FIELD from '@salesforce/schema/Employee__c.Phone__c';
import ID_FIELD from '@salesforce/schema/Employee__c.Id';
import { CurrentPageReference } from 'lightning/navigation';
import { registerListener, unregisterAllListeners } from 'c/pubsub';
import { fireEvent } from 'c/pubsub';

export default class UpdateEmployee extends LightningElement {
    @track error;
    @track openmodel = false;
    @api recordId;

    @wire(getSingleEmployee,{recordId: '$recordId'}) emp;
    @wire(CurrentPageReference) pageRef; // Required by pubsub

    connectedCallback() {
        // subscribe(register) to EmployeeUpdate event
        registerListener('updateEmployeeEvent', this.openmodal, this);
    }
    disconnectedCallback() {
        // unsubscribe(unregister) from EmployeeUpdate event
        unregisterAllListeners(this);
    }

       // open window   
       openmodal(empRecordID) {
         /*eslint-disable no-console */
         console.log('method called' +empRecordID);
           this.recordId = empRecordID;
           this.openmodel = true
       }
   
       //close window
       closeModal() {
           this.openmodel = false
       } 
   

    updateEmployee() {
        const allValid = [...this.template.querySelectorAll('lightning-input')]
            .reduce((validSoFar, inputFields) => {
                inputFields.reportValidity();
                return validSoFar && inputFields.checkValidity();
            }, true);

        if (allValid) {
            // Create the recordInput object
            /*eslint-disable no-console */
            //console.log('All Valid');
            const fields = {};
            fields[ID_FIELD.fieldApiName] = this.recordId;
            fields[FIRSTNAME_FIELD.fieldApiName] = this.template.querySelector("[data-field='First_Name__c']").value;
            /*eslint-disable no-console */
            console.log(this.template.querySelector("[data-field='First_Name__c']").value);
            fields[LASTNAME_FIELD.fieldApiName] = this.template.querySelector("[data-field='Last_Name__c']").value;
            fields[PHONE_FIELD.fieldApiName] = this.template.querySelector("[data-field='Phone__c']").value;

            const recordInput = { fields };

            updateRecord(recordInput)
                .then(() => {
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'Success',
                            message: 'Employee updated',
                            variant: 'success'
                        })
                    );
                this.closeModal();
                fireEvent(this.pageRef, 'refreshEmp', recordInput);
                    // Display fresh data in the form
                    //return refreshApex(this.emp);
                })
                .catch(error => {
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'Error creating record',
                            message: error.body.message,
                            variant: 'error'
                        })
                    );
                });
            }
        else {
            // The form is not valid
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Something is wrong',
                    message: 'Check your input and try again.',
                    variant: 'error'
                })
             );
        }
    }


}