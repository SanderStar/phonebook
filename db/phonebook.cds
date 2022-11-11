namespace creetion.training.cap;

type PhoneType : String enum {
    M; // Mobile
    H; // Home
    W; // Work
    X; // Unknown
}

entity Phonebook {
    key ID               : Integer;
        name             : String;
        type             : PhoneType;
        number           : String;
        virtual isMobile : Boolean;
}
