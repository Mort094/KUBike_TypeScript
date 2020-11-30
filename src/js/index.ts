import axios, {
    AxiosResponse,
    AxiosError
} from "../../node_modules/axios/index";
// import { Vue } from "../../node_modules/vue/types/vue";
//import { QrcodeStream, QrcodeDropZone, QrcodeCapture } from "../../node_modules/vue-qrcode-reader";
// import VueQrcodeReader from "../../node_modules/vue-qrcode-reader/index";

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
        _status: null,
        decodedContent: '',
        errorMessage: '',
        loggedIn: true,
        contentCheck: "",
        loginPage: false,
        createUserPage: false,
        overviewPage: true,
        cyclePage: false,
        cycle_id: null,
        QR_ScanPage: false,
        singleCycle: null,
        loginEmail: "",
        loginPassword: "",
        addData: { user_email: "", user_password: "", user_firstname: "", user_lastname: "", user_mobile: 0 },
        addMessage: "",
        cycles: []
    }, created() {
        console.log(window.location.search)
        //this.getOneBike(this.cycle_id)
    },
    methods: {

        login() {
            if (this.loginEmail == "test" && this.loginPassword == "test") { //axios get
                this.loggedIn = true
            } else {
                this.errorMessage = "Wrong"
            }

        },
        loginTry(vendor: string) {
            var mailformat = /^[a-zA-Z0-9.!#$%&'*+=?^_`{|}~-]+@+k+u+\.+d+k/;
            // https://regex101.com/r/h7oSha/1
            if(this.loginEmail.match(mailformat))
            {
                if(this.loginPassword == ''){
                    this.errorMessage = "Du skal skrive et password";
                }
                else{
                    this.LoginHelpAndShow(baseUserUrl + this.loginEmail + '/' + this.loginPassword)
                }
            }
            else
            {
            this.errorMessage = "Dette er ikke en rigtig email!";
            }
        },
        LoginHelpAndShow(url: string) { // helper metode: getAllCar + getByVendor are very similar
            axios.get<IUser[]>(url)
                .then((response: AxiosResponse<IUser[]>) => {
                    this.loggedIn = response.data
                    if(this.loggedIn == true)
                    {
                        this.user_email = this.loginEmail
                        this.loggedIn = response.data
                        console.log(`Denne bruger email er blevet logget ind "${this.user_email}" `)
                    }
                   
                    this.errorMessage = "Forkert Email eller Password"
                })
                .catch((error: AxiosError) => {
                    error.message = this.message
                    alert(error.message) // https://www.w3schools.com/js/js_popup.asp
                })
        },
        logout() {
            this.loggedIn = false
        }, createPage() {
            this.createUserPage = true
            this.loginPage = false

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
            if(this.contentCheck == "http://qr.getbike/") {
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
            var mailformat = /^[a-zA-Z0-9.!#$%&'*+=?^_`{|}~-]+@+k+u+\.+d+k/;
            // https://regex101.com/r/h7oSha/1
            console.log(this.addData.user_email)
            console.log(this.addData.user_email.match(mailformat))
            if(this.addData.user_email.match(mailformat))
            {
                axios.post<IUser>(baseUserUrl, this.addData)
                .then((response: AxiosResponse) => {
                    let message: string = "response " + response.status + " " + response.statusText
                    console.log(message)
                    this.addMessage = message

                })
                .catch((error: AxiosError) => {
                    // this.addMessage = error.message
                    alert(error.message)
                })
            }
            else
            {
            this.errorMessage = "Dette er ikke en @ku.dk mail!";
            }
        },
        onDecode(content: any) {
            this.decodedContent = content
            this.contentCheck = content.substr(0,18)
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
    }
})