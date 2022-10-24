// TO DO: 
//  Replace certain strings with enum type
//  Check if link is correct (url or email) - employer picks one first
//  Add location + isRemote boolean, salary range, image url
//  Creatable select for skills, location, position
//  Company should reference companyId or use creatable select
export default [
    {
        id: '1',
        createdAt: new Date(),
        title: 'Junior Frontend Developer',
        type: 'fulltime',
        location: 'remote',
        company: 'Treasure Data',
        companyUrl: 'https://www.treasuredata.com',
        skills: ['HTML', 'CSS', 'JavaScript', 'React.js'],
        featured: false,
        link: 'https://www.treasuredata.com'
    },
    {
        id: '2',
        createdAt: new Date(),
        title: 'Senior Frontend Developer',
        type: 'fulltime',
        location: 'remote',
        company: 'Treasure Data',
        companyUrl: 'https://www.treasuredata.com',
        skills: ['HTML', 'CSS', 'JavaScript', 'React.js', 'Node.js'],
        featured: false,
        link: 'https://www.treasuredata.com'
    },
    {
        id: '3',
        createdAt: new Date(),
        title: 'Intern',
        type: 'fulltime',
        location: 'remote',
        company: 'Treasure Data',
        companyUrl: 'https://www.treasuredata.com',
        skills: ['HTML', 'CSS', 'JavaScript', 'React.js'],
        featured: false,
        link: 'https://www.treasuredata.com'
    },
]