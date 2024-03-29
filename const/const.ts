// TO DO: Break up into separate files

export enum AUTH_STATUS {
    LOADING = 'loading',
    AUTHENTICATED = 'authenticated',
    UNAUTHENTICATED = 'unauthenticated'
}

export enum ROLE {
    EMPLOYER = 'employer',
    ADMIN = 'admin'
}

export const TYPE = {
    FULLTIME: 'fulltime',
    PARTTIME: 'parttime',
    CONTRACT: 'contract'
}

export const TYPE_MAP = {
    [TYPE.FULLTIME]: 'Full time',
    'Full-time': 'Full time',
    [TYPE.PARTTIME]: 'Part time',
    'Part-time': 'Part time',
    [TYPE.CONTRACT]: 'Contract'
}

export const LOCATION = {
    REMOTE: 'remote',
    OFFICE: 'office'
}

export const LOCATION_MAP = {
    [LOCATION.REMOTE]: 'Remote',
    [LOCATION.OFFICE]: 'In Office'
}

export const SKILLS = [
    'HTML',
    'HTML5',
    'CSS',
    'CSS3',
    'JavaScript',
    'TypeScript',
    'React',
    'Redux',
    'Angular',
    'Vue',
    'Node',
    'Express',
    'NextJS',
    'jQuery',
    'AJAX',
    'React Native',
    'Android',
    'Swift',
    'Python',
    'Ruby',
    'Java',
    'PHP',
    'C++',
    'C#',
    'Django',
    'Rails',
    'SQL',
    'MySQL',
    'PostgreSQL',
    'MongoDB',
    'Kafka',
    'GraphQL'
]

export const PERKS = [
    'Work from home', 
    'Unlimited vacation',
    'Health insurance', 
    'Dental insurance', 
    'Vision insurance',
    '401k matching',
    'Parental leave',
    'Gym stipend'
]

export const CONTACT_MESSAGE_TYPE = {
    CUSTOMER_SUPPORT: 'Customer Support',
    FEEDBACK: 'Feedback',
    FEATURE_REQUEST: 'Feature Request',
    OTHER: 'Other'
}