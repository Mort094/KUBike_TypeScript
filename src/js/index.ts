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
let baseTripUrl: string = "https://mort-rest.azurewebsites.net/api/trip/"
let baseMessageUrl: string = "https://mort-rest.azurewebsites.net/api/messages/"

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
interface ITrip {
    trip_start: string
    trip_end: string
    trip_map_json: string
    fk_cycle_id: number
    fk_user_id: number
}
interface IMessage {
    messages_Id: number
    messages_user_id: number
    messages_cycle_id: number
    messages_emne: string
    messages_besked: string
    messages_status: number
}

new Vue({
    el: "#app",
    data: {
        currentDateWithFormat: "",
        select: '',
        _status: null,
        decodedContent: '',
        singleCycle: null,
        endTime: "",
        //#region Id's
        CurrentUserId: null,
        cycle_id: 0,
        //#region CurrentUser
        CurrentUserName: "",
        CurrentLastName: "",
        CurrentEmail: "",
        CurrentPhone: 0,
        //#endregion
        //#region Messages
        errorMessage: '',
        contentCheck: "",
        addMessage: "",
        updateMessage: "",
        //#endregion
        //#region Message for bike 
        messageSubject: "",
        Mresponse: null,
        messageText: "",
        //#endregion
        NewCycleName: "",
        //#region Pages
        loginPage: true,
        loggedIn: false,
        //admin
        admin: false,
        ADMCyclePage: false,
        ADMOverviewPage: false,
        ADMSettingsPage: true,
        ADMMessagesPage: false,
        //before login
        createUserPage: false,
        //After login
        overviewPage: false,
        cyclePage: false,
        QR_ScanPage: false,
        profilePage: false,
        settingsPage: false,
        Cykellisteside: false,
        updateUserPage: false,
        //#endregion
        //#region Arrays
        currentTripId: null,
        currentTrip: [],
        cycles: [],
        cycles2: [],
        activeBikes: [],
        AllUserTrips: [],
        CyclesInUse: [],
        AllMessages: [],
        AllMessagesBike: [],
        //#endregion
        //#region login
        loginEmail: "",
        loginPassword: "",
        ResponseTrip: null,
        //#endregion
        cycle_name: "",
        //#region Create data
        addData: { user_email: "", user_password: "", user_firstname: "", user_lastname: "", user_mobile: 0 },
        addTripData: { trip_start: "", trip_end: "", trip_map_json: "", user_id: 0, cycle_id: 0 },
        addTripEnd: { trip_end: "" },
        updateUserData: { user_firstname: "", user_lastname: "", user_email: "", user_mobile: 0 },
        addMessageData: { messages_Id: 0, user_id: 0, cycle_id: 0, Emne: "", Besked: "", status: 0 },
        addCycleData: { cycle_name: "", cycle_coordinates: "" }
        //#endregion
    },
    created() {
        this.getAllBikes()
        this.cycles
        this.getAllBikesAdmin()
        this.cycles2
        this.activeBikes

    },
    methods: {
        //#region Login
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
                        this.HentBruger()
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
                        if (this.loginEmail == "adm@ku.dk") {
                            this.admin = true
                        }
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
            this.loginPage = true
            this.loginEmail = null
            this.loginPassword = null
            this.CurrentUserId = null
            this.admin = false
        },
        //#endregion
        //#region Pages
        ADMMessagesPageCall() {
            this.ADMHentBeskeder()
            this.ADMOverviewPage = false
            this.ADMCyclePage = false
            this.ADMSettingsPage = false
            this.ADMMessagesPage = true
        },

        createPage() {
            this.createUserPage = true
            this.loginPage = false
            this.errorMessage = ''
        },
        backToLoginPage() {
            this.createUserPage = false
            this.loginPage = true
        },
        ADMUOverviewPage() {
            this.ADMOverviewPage = true
            this.ADMCyclePage = false
            this.ADMSettingsPage = false
        },
        ADMCyclesPage() {
            this.ADMOverviewPage = false
            this.ADMCyclePage = true
            this.ADMSettingsPage = false
        },
        ADMSettingPage() {
            this.ADMOverviewPage = false
            this.ADMCyclePage = false
            this.ADMSettingsPage = true
        },
        OverviewPage() {
            this.settingsPage = false
            this.Cykellisteside = true
            this.QR_ScanPage = false
            this.cyclePage = false
            this.profilePage = false
            this.updateUserPage = false
            this.GetActiveBikes()
            this.GetActiveBikesFromTrip()
        },
        QRPage() {
            this.settingsPage = false
            this.overviewPage = false
            this.QR_ScanPage = true
            this.cyclePage = false
            this.profilePage = false
            this.Cykellisteside = false
            this.GetActiveBikes()
            this.GetActiveBikesFromTrip()
            this.updateUserPage = false
            // setTimeout(() => this.CheckIfBikeIsAvailable().bind(this), 5)
        },

        SpecificCyclePage() {
            if (this.contentCheck == "http://qr.getbike/") {
                this.QR_ScanPage = false
                this.getOneBike()
                this.getCurrentTrip()
                this.cyclePage = true
                this.Cykellisteside = false
                this.updateUserPage = false
            }
            else {
                alert("ikke en gyldig QR")
            }

        },
        Settings() {
            this.settingsPage = true
            this.overviewPage = false
            this.QR_ScanPage = false
            this.cyclePage = false
            this.profilePage = false
            this.Cykellisteside = false
            this.updateUserPage = false
        },
        Profile() {
            this.settingsPage = false
            this.overviewPage = false
            this.QR_ScanPage = false
            this.cyclePage = false
            this.profilePage = true
            this.Cykellisteside = false
            this.updateUserPage = false
            this.HentAltOmEnBruger()
        },
        UpdateUserPage() {
            this.settingsPage = false
            this.overviewPage = false
            this.QR_ScanPage = false
            this.cyclePage = false
            this.profilePage = false
            this.Cykellisteside = false
            this.updateUserPage = true
            this.InputFilled()



        },
        //#endregion
        //#region Trip
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

        opretTrip() {
            let urlSecond = baseTripUrl
            this.TimeFunction()
            this.addTripData.user_id = this.CurrentUserId
            this.addTripData.cycle_id = this.cycle_id
            this.addTripData.trip_map_json = "some map stuff"
            this.addTripData.trip_start = this.currentDateWithFormat
            this.addTripData.trip_end = "Awaiting end"
            axios.post<ITrip>(urlSecond, this.addTripData)
                .then
                ((response: AxiosResponse) => {
                    //this.currentTrip[] = response
                    //sideskift?
                    this.responseTrip = response.data
                }
                )
                .catch(
                    (error: AxiosError) => {
                        alert(error.message)
                    }
                )
            this.startTrip()
        },

        TimeFunction: function () {
            this.currentDateWithFormat = new Date().toString()
            console.log(this.currentDateWithFormat);
        },

        slutTrip(_status: 2) {
            this.getCurrentTrip()
            let urlGet = baseCycleUrl + "slut/" + this.cycle_id
            //this.EndTripTime()
            this.GetActiveBikes()
            if (this.activeBikes.indexOf(this.cycle_id)) {
                axios.put<ICycle>(urlGet)
                    .then((response: AxiosResponse<ICycle>) => {
                        console.log(response.data)
                    })
                    .catch((error: AxiosError) => {
                        alert(error.message);
                    })
                alert("Tur Stoppet")
            }
            else {
                alert("Du er ikke den registrerede bruger af denne cykel")
            }

        },

        EndTripTime(): void {
            this.TimeFunction()
            this.endTime = this.currentDateWithFormat
            let urlGet = baseTripUrl + "slutTrip/" + this.currentTripId + "?time=" + this.endTime
            this.addTripEnd.trip_end = this.currentDateWithFormat
            console.log('update' + urlGet)
            console.log(this.currentTripId)
            if (this.currentTripId != 0) {
                axios.put<string>(urlGet, this.addTripEnd)
                    .then(response => {
                        console.log(response);
                        this.slutTrip();
                        alert("afslut registreret")
                    })
                    .catch(error => {
                        console.log(error);
                    });
            }
            else {
                alert("Du har ikke en aktiv rute på denne cykel.")
            }
        },

        getCurrentTrip() {
            let urlGet = baseTripUrl + "getwithuser/" + this.CurrentUserId + "/" + this.cycle_id
            axios.get<ITrip>(urlGet)
                .then((response: AxiosResponse<ITrip>) => {
                    this.currentTripId = response.data
                })
                .catch((error: AxiosError) => {
                    alert(error.message);
                })
        },

        GetFullCurrentTrip() {
            let urlGet = baseTripUrl + this.currentTripId
            axios.get<ITrip>(urlGet)
                .then((response: AxiosResponse<ITrip>) => {
                    this.currentTrip = response.data
                    alert("XXX")
                })
                .catch((error: AxiosError) => {
                    alert(error.message);
                })
        },

        GetActiveBikesFromTrip() {
            let urlGet = baseTripUrl + "allecyklerfraruter"
            axios.get<ITrip>(urlGet)
                .then((response: AxiosResponse<ITrip>) => {
                    this.CyclesInUse = response.data
                })
                .catch((error: AxiosError) => {
                    alert(error.message);
                })
        },
        CheckIfBikeIsAvailableWithoutQR() {
            if (this.CyclesInUse.includes(parseInt(this.cycle_id))) {
                //  x.style.visibility = "visible";
                alert("cykel er i brug")
            }
            else {
                alert("cykel er ledig")
                this.opretTrip();
            }
        },

        CheckIfBikeIsAvailable() {
            var x = document.getElementById("StatButton")
            if (this.CyclesInUse.includes(parseInt(this.cycle_id))) {
                //  x.style.visibility = "visible";
                x.style.visibility = "hidden";
                alert("cykel er i brug")
            }
            else {
                alert("cykel er ledig")
                this.opretTrip();
            }
        },
        //#endregion
        //#region Bruger
        HentBruger() {
            let urlGet = baseUserUrl + this.loginEmail
            axios.get<IUser>(urlGet)
                .then((response: AxiosResponse<IUser>) => {
                    this.CurrentUserId = response.data
                    console.log(urlGet)
                })
                .catch((error: AxiosError) => {
                    alert(error.message);
                })

        },
        deactivateUser() {
            if(confirm("Er du sikker på at du vil slette din bruger?")){
            let urlPut = baseUserUrl + "deactivate/" + parseInt(this.CurrentUserId)
            axios.put<IUser>(urlPut)
            .then((response: AxiosResponse) =>
            {
                console.log("")
                this.CurrentUserId = response.data
                this.loggedIn = false
                this.loginPage = true

            })
            .catch((error: AxiosError) =>
            {
                alert(error.message)
            })}
        },
        HentAltOmEnBruger() {
            let urlGet = baseUserUrl + "user/" + parseInt(this.CurrentUserId)
            axios.get<IUser>(urlGet)
                .then((response: AxiosResponse<IUser>) => {
                    this.CurrentUserName = response.data.user_firstname
                    this.CurrentLastName = response.data.user_lastname
                    this.CurrentEmail = response.data.user_email
                    this.CurrentPhone = response.data.user_mobile
                })
                .catch((error: AxiosError) => {
                    alert(error.message);
                })
        },
        InputFilled(){
            this.HentAltOmEnBruger()
            this.updateUserData.user_firstname = this.CurrentUserName
            this.updateUserData.user_lastname = this.CurrentLastName
            this.updateUserData.user_email = this.CurrentEmail
            this.updateUserData.user_mobile = this.CurrentPhone
        },
        updateUser() {
            let url: string = baseUserUrl + "updateUser/" + parseInt(this.CurrentUserId)
            axios.put<IUser>(url, this.updateUserData)
                .then((response: AxiosResponse) => {
                    let message: string = "response " + response.status + " " + response.statusText
                    this.updateMessage = message
                    this.updateUserPage = false
                    this.profilePage = true
                    this.HentAltOmEnBruger()
                })
                .catch((error: AxiosError) => {
                    alert(error.message);
                })
        },

        TjekBruger() {
            let urlGet = baseTripUrl + "allusertrips/" + this.CurrentUserId
            axios.get<ITrip[]>(urlGet)
                .then((response: AxiosResponse<ITrip[]>) => {
                    this.AllUserTrips = response.data
                })
                .catch((error: AxiosError) => {
                    alert(error.message);
                })
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
        //#endregion
        //#region Bikes
        helperGetAndShow(url: string) {
            axios.get<ICycle[]>(url)
                .then((response: AxiosResponse<ICycle[]>) => {
                    this.cycles = response.data
                })
                .catch((error: AxiosError) => {
                    //this.message = error.message
                    alert(error.message) // https://www.w3schools.com/js/js_popup.asp
                })
        },
        HentCykelIDFraSelect() {
            this.cycle_id = parseInt(this.select)
            this.getCurrentTrip()
            this.CheckIfBikeIsAvailableWithoutQR()
        },
        HentCykelIDFraSelectEnd() {
            this.cycle_id = parseInt(this.select)
            setTimeout(this.getCurrentTrip(), 300)
            //this.getCurrentTrip()
            setTimeout(this.EndTripTime(), 500)
            // this.EndTripTime()

        },
        HentCykelIDSelect() {
            this.cycle_id = parseInt(this.select)
            //this.getCurrentTrip()
            //this.CheckIfBikeIsAvailableWithoutQR() 
        },
        getAllBikesAdmin() {
            let url = baseCycleUrl + "alle-cykler/"
            axios.get<ICycle[]>(url)
                .then((response: AxiosResponse<ICycle[]>) => {
                    this.cycles2 = response.data
                })
                .catch((error: AxiosError) => {
                    alert(error.message)
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
                if (this.cycle_id != null) {
                    let urlGet = baseCycleUrl + "ledig/" + this.cycle_id
                    axios.get<ICycle>(urlGet)
                        .then((response: AxiosResponse<ICycle>) => {
                            this.singleCycle = response.data
                        })
                        .catch((error: AxiosError) => {
                            alert("Cykel er ikke ledig")
                        })
                }
                else {
                    alert("ikke en gyldig cykel QR")
                }
            }
            else {
                alert("Ikke en gyldig Cykel QR.");
            }
        },
        GetActiveBikes() {
            let url = baseTripUrl + "allusertrips/" + this.CurrentUserId
            axios.get<ITrip[]>(url)
                .then((response: AxiosResponse<ITrip[]>) => {
                    this.activeBikes = response.data
                })
                .catch((error: AxiosError) => {
                    alert(error.message);
                })
        },

        ADMAddBike() {
            let urlGet = baseCycleUrl
            this.addCycleData.cycle_name = this.NewCycleName
            this.addCycleData.cycle_coordinates = "New Coordinates"
            axios.post<IMessage>(urlGet, this.addMessageData)
                .then
                ((response: AxiosResponse) => {
                    //this.currentTrip[] = response
                    //sideskift?
                    this.Mresponse = response.data
                    alert("Cykel tilføjet")
                }
                )
                .catch(
                    (error: AxiosError) => {
                        alert(error.message)
                    }
                )
        },

        ADMDeleteBike() {
            if(confirm("Do you really want to delete?")) {
            let urlGet = baseCycleUrl + parseInt(this.cycle_id)
            axios.delete<ICycle>(urlGet)
            .then
            ((response: AxiosResponse) => {
                //this.currentTrip[] = response
                //sideskift?
                this.Mresponse = response.data
                alert("Cykel slettet")
            }
            )
            .catch(
                (error: AxiosError) => {
                    alert(error.message)
                }
            )
            }
        },

        //#endregion  
        //#region QR code
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
        },
        //#endregion
        //#region Bike available/not
        Unavaliable(_status: 1) {
            let urlGet = baseCycleUrl + "start/" + this.select
            // this.opretTrip()
            axios.put<ICycle>(urlGet)
                .then((response: AxiosResponse<ICycle>) => {
                    this.select = response.data
                })
                .catch((error: AxiosError) => {
                    alert(error.message)
                })
            alert("Unavaliable Now")
        },
        Avaliable(_status: 2) {
            let urlGet = baseCycleUrl + "slut/" + this.select
            axios.put<ICycle>(urlGet)
                .then((response: AxiosResponse<ICycle>) => {
                    this.select = response.data
                })
                .catch((error: AxiosError) => {
                    alert(error.message)
                })
            alert("Avaliable Now")
        },
        //#endregion
        //#region Messages
        opretMessage() {
            let urlSecond = baseMessageUrl
            this.addMessageData.messages_Id = this.CurrentUserId
            this.addMessageData.messages_cycle_id = parseInt(this.cycle_id)
            this.addMessageData.messages_emne = this.messageSubject
            this.addMessageData.messages_besked = this.messageText
            this.addMessageData.messages_status = 1
            axios.post<IMessage>(urlSecond, this.addMessageData)
                .then
                ((response: AxiosResponse) => {
                    //this.currentTrip[] = response
                    //sideskift?
                    this.Mresponse = response.data
                    alert("Klage oprettet")
                }
                )
                .catch(
                    (error: AxiosError) => {
                        alert(error.message)
                    }
                )
        },

        opretStolen() {
            let urlGet = baseMessageUrl
            this.addMessageData.messages_Id = this.CurrentUserId
            this.addMessageData.messages_cycle_id = parseInt(this.cycle_id)
            this.addMessageData.messages_emne = "STOLEN"
            this.addMessageData.messages_besked = "STOLEN"
            this.addMessageData.messages_status = 4
            axios.post<IMessage>(urlGet, this.addMessageData)
                .then
                ((response: AxiosResponse) => {
                    //this.currentTrip[] = response
                    //sideskift?
                    this.Mresponse = response.data
                    alert("Cykel er meldt væk")
                    this.startTrip()
                }
                )
                .catch(
                    (error: AxiosError) => {
                        alert(error.message)
                    }
                )
        },

        ADMHentBeskeder() {
            let urlGet = baseMessageUrl
            axios.get<IMessage>(urlGet)
                .then
                ((response: AxiosResponse) => {
                    this.AllMessages = response.data
                    alert("Beskeder hentet")
                })
                .catch(
                    (error: AxiosError) => {
                        alert(error.message)
                    }
                )
        },

        ADMHentBeskederCykel() {
            let urlGet = baseMessageUrl + "cykel/" + parseInt(this.select)
            axios.get<IMessage[]>(urlGet)
                .then
                ((response: AxiosResponse<IMessage[]>) => {
                    this.AllMessagesBike = response.data
                    console.log(urlGet)
                })
                .catch(
                    (error: AxiosError) => {
                        alert(error.message)
                    }
                )

        },

        ADMHentCykelIDFraSelect() {
            this.cycle_id = parseInt(this.select)
        },

        //#endregion
    },
})
