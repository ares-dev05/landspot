const UserAction = Object.freeze({
    SHOW_ENQUIRE_DIALOG: Symbol('SHOW_ENQUIRE_DIALOG'),
});

export default UserAction;


export class EnquireDialogStep {
    static get EMAIL() {
        return 1;
    }

    static get REGION() {
        return 2;
    }

    static get PHONE() {
        return 3;
    }

    static get END() {
        return -1;
    }

    static nextStep(ApplicationStep) {
        switch (ApplicationStep) {
            case this.EMAIL:
                return this.REGION;
            case this.REGION:
                return this.PHONE;
            case this.PHONE:
                return this.END;
            default:
                return this.EMAIL;
        }
    }
}