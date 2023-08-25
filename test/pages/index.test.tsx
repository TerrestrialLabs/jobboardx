import { render, RenderResult, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import Home from '../../pages/index'
import { JobBoardContext } from '../../context/JobBoardContext'
import { SessionContext } from '../../context/SessionContext'
import { AUTH_STATUS } from '../../const/const'
// import axios from '../../api/axios'
import axios from 'axios'
import axiosInstance from '../../api/axios'
import React from 'react'

const job = {
    applicationLink: "https://www.simplyhired.com/job/u2sIRCBMcJc7UYuVj3OpdYNbYeJvWsjJlNY7KhZVfFetZp3oxwNxUA",
    backfilled: true,
    company: "Peraton",
    companyLogo: "http://res.cloudinary.com/dvwtrieuk/image/upload/v1684357426/logos/h6kjisvuudsvlisnwrik.jpg",
    companyUrl: "N/A",
    createdAt: "2023-05-17T21:03:47.029Z",
    datePosted: "2023-05-17T21:03:25.682Z",
    featured: false,
    jobboardId: "63891249d12218862f638185",
    location: "Basking Ridge, NJ",
    perks: ["Work from home", "Flexible schedule"],
    remote: false,
    salaryMax: 95400,
    salaryMin: 75300,
    skills: ["Top Secret Clearance", "Computer Science", "CSS", "Software Engineering", "React", "RESTful API"],
    title: "UI/UX Developer",
    type: "fulltime",
    updatedAt: "2023-05-17T21:03:47.029Z",
    __v: 0,
    _id: "646541335600e424ff0275e0"
}

jest.mock('next/router', () => ({
    useRouter() {
        return ({
            route: '/',
            pathname: '',
            query: '',
            asPath: '',
            push: jest.fn(),
            events: {
            on: jest.fn(),
            off: jest.fn()
            },
            beforePopState: jest.fn(() => null),
            prefetch: jest.fn(() => null)
        });
    },
}));

// jest.mock('axios', () => {
//     return {
//         create: jest.fn(),
//         defaults: {
//             baseURL: 'http://localhost:3000',
//             headers: {}
//         },
//         interceptors: {
//             request: { use: jest.fn(), eject: jest.fn() },
//             response: { use: jest.fn(), eject: jest.fn() },
//         },
//     };
// })
// jest.mock('axios')
jest.mock('axios', () => {
    return {
        create: () => {
            return {
                interceptors: {
                    request: {eject: jest.fn(), use: jest.fn()},
                    response: {eject: jest.fn(), use: jest.fn()},
                },
            }
        },
        defaults: {
            baseURL: 'http://localhost:3000',
            headers: {}
        },
        get: () => new Promise((resolve, reject) => {
                    return resolve({
                        data: [job]
                    })
                })
    }
})

// const getSpySuccess = jest.spyOn(axios, 'get').mockImplementation(() => {
//     return new Promise((resolve, reject) => {
//         return resolve({
//             data: [job]
//         })
//     })
// })
// const getSpySuccess = jest.spyOn(axios, 'get').mockResolvedValue({ data: [job] })

describe('Home page', () => {
    let component: RenderResult<typeof import("@testing-library/dom/types/queries"), HTMLElement, HTMLElement>

    beforeEach(async () => {
        jest.clearAllMocks()

        // jest.spyOn(axios, 'get').mockResolvedValue({
        //     data: [job]
        // })
        jest.spyOn(axios, 'get').mockImplementation(() => {
            return new Promise((resolve, reject) => {
                return resolve({
                    data: [job]
                })
            })
        })

        const useRouter = jest.spyOn(require('next/router'), 'useRouter')

        useRouter.mockImplementationOnce(() => ({
            route: '/',
            pathname: '',
            query: '',
            asPath: '',
            push: jest.fn(),
            events: {
              on: jest.fn(),
              off: jest.fn()
            },
            beforePopState: jest.fn(() => null),
            prefetch: jest.fn(() => null)
        }))

        component = render(
            <SessionContext.Provider value={{ status: AUTH_STATUS.AUTHENTICATED, logout: () => {}, login: () => {} }}>
                <JobBoardContext.Provider value={{ 
                    jobboard: {
                        _id: '0',
                        createdAt: new Date(),
                        title: 'Dev Jobs',
                        domain: 'devjobs.com',
                        company: 'Dev Jobs',
                        email: 'hi@example.com',
                        homeTitle: 'Title',
                        homeSubtitle: 'Subtitle',
                        heroImage: 'https://free-images.com/lg/8f1a/lake_mirror_reflection_yosemite.jpg',
                        logoImage: '',
                        skills: [],
                        priceFeatured: 100,
                        priceRegular: 50,
                        searchQuery: '',
                        twitterHashtags: []
                    }, 
                    baseUrl: 'http://localhost:3000', 
                    baseUrlApi: 'http://localhost:3000/api', 
                    isAdminSite: false 
                }}>
                    <Home />
                </JobBoardContext.Provider>
            </SessionContext.Provider>
        )
    })

    it('renders properly', async () => {
        const titleValue = screen.getByRole('heading', {level: 1})
        expect(titleValue).toBeInTheDocument()
        expect(titleValue).toHaveTextContent('Title')

        const subtitleValue = screen.getByRole('heading', {level: 2})
        expect(subtitleValue).toBeInTheDocument()
        expect(subtitleValue).toHaveTextContent('Subtitle')

        // await waitFor(() => expect(component.queryAllByText('abc')).toHaveLength(1));
        await waitFor(async () => { 
            // expect(getSpySuccess).toHaveBeenCalledTimes(1)
            const list = await screen.findAllByTestId('jobListItem')
            expect(list.length).toEqual(1)
        })
    


        // const list = await screen.findAllByTestId('jobListItem')
        // expect(list.length).toEqual(1)

        // await waitFor(async () => {
        //     const list = await screen.findAllByTestId('jobListItem')
        //     expect(list.length).toEqual(1)
        // })

        // await waitFor(() => {
        //     expect(screen.getByText('Peraton')).toBeInTheDocument();
        // })
    })
})