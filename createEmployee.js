import { LightningElement, wire, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import EMPLOYEE_OBJECT from '@salesforce/schema/Employee__c';
import FIRSTNAME_FIELD from '@salesforce/schema/Employee__c.First_Name__c';
import LASTNAME_FIELD from '@salesforce/schema/Employee__c.Last_Name__c';
import PHONE_FIELD from '@salesforce/schema/Employee__c.Phone__c';
import { CurrentPageReference } from 'lightning/navigation';
import { fireEvent } from 'c/pubsub';

export default class CreateEmployee extends LightningElement {


    @api Employee__c;
    @wire(CurrentPageReference) pageRef;


    employeeObject = EMPLOYEE_OBJECT;
    firstnameField = FIRSTNAME_FIELD;
    lastnameField = LASTNAME_FIELD;
    phoneField = PHONE_FIELD;

    fields = [FIRSTNAME_FIELD, LASTNAME_FIELD, PHONE_FIELD];

    handleSuccess() {
        const evt = new ShowToastEvent({
            title: "Success",
            message: 'Employee record added',
            variant: "success"
        });

        fireEvent(this.pageRef, 'EmployeeListUpdate', evt);
        // eslint-disable-next-line no-console
        console.log('Fire Event EmployeeListUpdate');
        const inputFields = this.template.querySelectorAll(
            'lightning-input-field'
        );
        if (inputFields) {
            inputFields.forEach(field => {
                field.reset();
            });
        }
    }

    handleReset() {
      
        const inputFields = this.template.querySelectorAll(
            'lightning-input-field'
        );
        if (inputFields) {
            inputFields.forEach(field => {
                field.reset();
            });
        }
    }

    handleError(event) {
       
        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Error creating record',
                message: event.detail.message,
                variant: 'error',
            }),
        );
    }



}