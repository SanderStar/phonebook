using creetion.training.cap as creetion from '../db/phonebook';

@requires : 'authenticated-user'
service PhonebookService {

    @restrict: [
        { grant: 'READ', to: ['display','change'] },
        { grant: 'CREATE', to: ['change'] },
        { grant: 'UPDATE', to: ['change'] },
        { grant: 'DELETE', to: ['change'] }
    ]
    entity Phonebooks as projection on creetion.Phonebook;
}