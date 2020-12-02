import axios, {
    AxiosResponse,
    AxiosError
} from "../../node_modules/axios/index";

// https://regex101.com/
// (Regular expression)
var mailformat = /^[a-zA-Z0-9.!#$%&'*+=?^_`{|}~-]+@+k+u+\.+d+k/;
var indholderTal = /\d/;
var indholdeSmallBogstaver = /.*[a-z].*/;
var indeholdeBigBogstaver = /.*[A-Z].*/;
var indholder8Tal = /\d\d\d\d\d\d\d\d/;



let baseCycleUrl: string = "https://mort-rest.azurewebsites.net/api/cycles/"
let baseUserUrl: string = "https://mort-rest.azurewebsites.net/api/users/"

interface ICycle {
    cycle_id: number
    cycle_name: string
    cycle_coordinates: string
    fk_cycle_status_id: number
}
interface IUser {
    user_id: number
    user_email: string
    user_password: string
    user_firstname: string
    user_lastname: string
    user_mobile: number
    fk_account_status_id: number
}

new Vue({
    el: "#app",
    data: {
        selected: null,
        _status: null,
        decodedContent: '',
        errorMessage: '',
        loggedIn: false,
        contentCheck: "",
        loginPage: false,
        createUserPage: false,
        overviewPage: false,
        cyclePage: false,
        CSPage: true,
        cycle_id: null,
        QR_ScanPage: false,
        singleCycle: null,
        loginEmail: "",
        loginPassword: "",
        addData: { user_email: "", user_password: "", user_firstname: "", user_lastname: "", user_mobile: 0 },
        addMessage: "",
        cycles: []
    }, 
    
    created() {
        // console.log(window.location.search)
        // this.getOneBike(this.cycle_id)
        this.getAllBikes()
        this.cycles
    },
    methods: {
        login() {
            this.createUserPage = false
            this.loginPage = true
            document.getElementById('login-email').className = "form-control";
        },
        loginTry(vendor: string) {
            // https://regex101.com/r/h7oSha/1
            if (this.loginPassword == '' && this.loginEmail == '') {
                this.errorMessage = "Du skal skrive dit password og din email";
                document.getElementById('login-password').className = "form-control error";
                document.getElementById('login-email').className = "form-control error";
            }
            else {
                if (this.loginPassword == '') {
                    this.errorMessage = "Du skal skrive et password";
                    document.getElementById('login-password').className = "form-control error";
                    document.getElementById('login-email').className = "form-control";

                }
                else if (this.loginEmail == '') {
                    this.errorMessage = "Du skal skrive et en email";
                    document.getElementById('login-password').className = "form-control";
                    document.getElementById('login-email').className = "form-control error";
                }
                else {
                    if (this.loginEmail.match(mailformat)) {
                        this.LoginHelpAndShow(baseUserUrl + this.loginEmail + '/' + this.loginPassword)
                    }
                    else {
                        this.errorMessage = "Din mail skal hedde @ku.dk";
                        document.getElementById('login-email').className = "form-control error";
                        document.getElementById('login-password').className = "form-control";

                    }
                }
            }

        },
        LoginHelpAndShow(url: string) { // helper metode: getAllCar + getByVendor are very similar
            axios.get<IUser[]>(url)
                .then((response: AxiosResponse<IUser[]>) => {
                    this.loggedIn = response.data
                    if (this.loggedIn == true) {
                        this.user_email = this.loginEmail
                        this.loggedIn = response.data
                        console.log(`Denne bruger email er blevet logget ind "${this.user_email}" `)
                    }

                    this.errorMessage = "Forkert Email eller Password"
                    //document.getElementById('opret-email').className = "green";
                    document.getElementById('login-password').className = "form-control error";
                    document.getElementById('login-email').className = "form-control error";
                })
                .catch((error: AxiosError) => {
                    error.message = this.message
                    alert(error.message) // https://www.w3schools.com/js/js_popup.asp
                })
        },
        logout() {
            this.loggedIn = false
        },
        createPage() {
            this.createUserPage = true
            this.loginPage = false
            this.errorMessage = ''
        },
        OverviewPage() {
            this.QR_ScanPage = false
            this.cyclePage = false
            this.overviewPage = true
        },
        QRPage() {
            this.QR_ScanPage = true
            this.overviewPage = false
            this.cyclePage = false
        },
        startTrip(_status: 1) {
            let urlGet = baseCycleUrl + "start/" + this.cycle_id
            axios.put<ICycle>(urlGet)
                .then((response: AxiosResponse<ICycle>) => {
                    this.singleCycle = response.data
                })
                .catch((error: AxiosError) => {
                    alert(error.message)
                })
            alert("Tur startet")
        },
        slutTrip(_status: 2) {
            let urlGet = baseCycleUrl + "slut/" + this.cycle_id
            axios.put<ICycle>(urlGet)
                .then((response: AxiosResponse<ICycle>) => {
                    this.singleCycle = response.data
                })
                .catch((error: AxiosError) => {
                    alert(error.message)
                })
            alert("Tur Stoppet")
        },
        helperGetAndShow(url: string) { // helper metode: getAllCar + getByVendor are very similar
            axios.get<ICycle[]>(url)
                .then((response: AxiosResponse<ICycle[]>) => {
                    this.cycles = response.data
                })
                .catch((error: AxiosError) => {
                    //this.message = error.message
                    alert(error.message) // https://www.w3schools.com/js/js_popup.asp
                })
        },
        getAllBikes() {
            this.helperGetAndShow(baseCycleUrl)
        },
        getOneBike() {
            if (this.contentCheck == "http://qr.getbike/") {
                let urlGet = baseCycleUrl + this.cycle_id
                axios.get<ICycle>(urlGet)
                    .then((response: AxiosResponse<ICycle>) => {
                        this.singleCycle = response.data
                    })
                    .catch((error: AxiosError) => {
                        alert(error.message)
                    })
                this.QR_ScanPage = false;
                this.cyclePage = true;
            }
            else {
                alert("Ikke en gyldig Cykel QR.");
            }
        },
        addUser() {

            var noError = true
            try {
                if (this.addData.user_email == '') throw 'emptyEmail';
                if (this.addData.user_password == '') throw 'emptyPassword';
                if (this.addData.user_firstname == '') throw 'emptyFirstName';
                if (this.addData.user_lastname == '') throw 'emptylastName';
                if (this.addData.user_mobile == '') throw 'emptyMobil';
                if (this.addData.user_password.match(indholderTal)) throw 'nullIntPassword';
                if (this.addData.user_password.match(indeholdeBigBogstaver)) throw 'bigStrPassword';
                if (this.addData.user_firstname.match(indholdeSmallBogstaver)) throw 'smallStrFirstName';
                if (this.addData.user_lastname.match(indholdeSmallBogstaver)) throw 'smallStrLastName';
                if (8 == this.addData.user_mobile.length() && this.addData.user_mobile.match(indholder8Tal)) throw '8xIntMobile';
                if (this.addData.user_email.match(mailformat)) throw 'kuMail';
                if (8 <= this.addData.user_password.length() || this.addData.user_user_password.length() <= 32) throw 'passwordLength';
            }
            catch (err) {
                var errorNumber = err
                noError = false
            }
            finally {
                if (noError == true) {
                    axios.post<IUser>(baseUserUrl, this.addData)
                        .then
                        (
                            (response: AxiosResponse) => {
                                let message: string = "response " + response.status + " " + response.statusText
                                console.log(message)
                                this.addMessage = message
                                this.loginPage = true
                                this.createUserPage = false
                            }
                        )
                        .catch(
                            (error: AxiosError) => {
                                this.errorMessage = error.message
                                this.errorMessage
                            }
                        )
                }
                else {
                    // Nulstil alle opret class
                    document.getElementById('opret-email').className = "form-control";
                    document.getElementById('opret-password').className = "form-control";
                    document.getElementById('opret-name').className = "form-control";
                    document.getElementById('opret-lastname').className = "form-control";
                    document.getElementById('opret-phone').className = "form-control";

                    if (errorNumber == 'emptyEmail') {
                        this.errorMessage = 'Du skal skrive noget i email';
                        document.getElementById('opret-email').className = "form-control error";
                    }
                    if (errorNumber == 'emptyPassword') {
                        this.errorMessage = 'Du skal skrive et password';
                        document.getElementById('opret-password').className = "form-control error";
                    }
                    if (errorNumber == 'emptyFirstName') {
                        this.errorMessage = 'Du skal skrive et fornavn';
                        document.getElementById('opret-name').className = "form-control error";
                    }
                    if (errorNumber == 'emptylastName') {
                        this.errorMessage = 'Du skal skrive et efternavn';
                        document.getElementById('opret-lastname').className = "form-control error";
                    }
                    if (errorNumber == 'emptyMobil') {
                        this.errorMessage = 'Du skal skrive et telefonnummer';
                        document.getElementById('opret-phone').className = "form-control error";
                    }
                    if (errorNumber == 'nullIntPassword') {
                        this.errorMessage = 'Dit password skal indholde tal';
                        document.getElementById('opret-password').className = "form-control error";
                    }
                    if (errorNumber == 'bigStrPassword') {
                        this.errorMessage = 'Dit password skal indholde små bogstaver';
                        document.getElementById('opret-password').className = "form-control error";
                    }
                    if (errorNumber == 'smallStrFirstName') {
                        this.errorMessage = 'Dit password skal indholde store bogstaver';
                        document.getElementById('opret-password').className = "form-control error";
                    }
                    if (errorNumber == 'smallStrLastName') {
                        this.errorMessage = 'Dit fornavn skal indholde bogstaver';
                        document.getElementById('opret-name').className = "form-control error";
                    }
                    if (errorNumber == '8xIntMobile') {
                        this.errorMessage = 'Dit efternavn skal indholde bogstaver';
                        document.getElementById('opret-lastname').className = "form-control error";
                    }
                    if (errorNumber == 'kuMail') {
                        this.errorMessage = 'Dit telefonnummer skal indholde == 8 tal';
                        document.getElementById('opret-phone').className = "form-control error";
                    }
                    if (errorNumber == 'passwordLength') {
                        this.errorMessage = 'Du skal bruge din skole email fx navn@ku.dk';
                        document.getElementById('opret-email').className = "form-control error";
                    }
                    else {
                        console.log('errorNumber ?? er blevet lavet om? LAD VÆR MED AT ØDELÆGGE MIN KODE! SKAL GIVE ET FRA 1 til 12')
                    }
                }
            }


        },
        onDecode(content: any) {
            this.decodedContent = content
            this.contentCheck = content.substr(0, 18)
            this.cycle_id = content.slice(18)
        },

        onInit(promise: any) {
            promise.then(() => {
                console.log('Successfully initilized! Ready for scanning now!')
            })
                .catch((error: { name: string; message: string; }) => {
                    if (error.name === 'NotAllowedError') {
                        this.errorMessage = 'Hey! I need access to your camera'
                    } else if (error.name === 'NotFoundError') {
                        this.errorMessage = 'Do you even have a camera on your device?'
                    } else if (error.name === 'NotSupportedError') {
                        this.errorMessage = 'Seems like this page is served in non-secure context (HTTPS, localhost or file://)'
                    } else if (error.name === 'NotReadableError') {
                        this.errorMessage = 'Couldn\'t access your camera. Is it already in use?'
                    } else if (error.name === 'OverconstrainedError') {
                        this.errorMessage = 'Constraints don\'t match any installed camera. Did you asked for the front camera although there is none?'
                    } else {
                        this.errorMessage = 'UNKNOWN ERROR: ' + error.message
                    }
                })
        }
    },
    Unavaliable(_status: 1) {
        let urlGet = baseCycleUrl + "start/" + this.cycle_id
        axios.put<ICycle>(urlGet)
            .then((response: AxiosResponse<ICycle>) => {
                this.selected = response.data
            })
            .catch((error: AxiosError) => {
                alert(error.message)
            })
        alert("Unavaliable Now")
    },
    Avaliable(_status: 2) {
        let urlGet = baseCycleUrl + "slut/" + this.cycle_id
        axios.put<ICycle>(urlGet)
            .then((response: AxiosResponse<ICycle>) => {
                this.selected = response.data
            })
            .catch((error: AxiosError) => {
                alert(error.message)
            })
        alert("Avaliable Now")
    },
})