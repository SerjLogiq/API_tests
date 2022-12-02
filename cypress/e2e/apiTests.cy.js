/// <reference types="cypress"/>
import { faker } from '@faker-js/faker'



  it(' 1 Get all posts. Verify HTTP response status code and content type.', () => {
    cy.log('**Getting all posts and verifying status code and content-type**')
    cy.request('GET','/posts').then(response => {
      expect (response.status).to.be.eq(200); // status code
      expect (response.headers['content-type']).to.be.eq('application/json; charset=utf-8')
    })
  })

  it('2 Get only first 10 posts. Verify HTTP response status code. Verify that only first posts are returned.', () => {
    let postsCount = 10
    cy.log('**Getting 10 last posts by using limit Query**')
    cy.request('GET',`/posts?_limit=${postsCount}`).then(response => {
      
      expect(response.body.length).to.be.eq(10)
      expect(response.body[0]['userId']).to.be.eq(1) // не знав ще як можна це перевірити Verify that only first posts are returned.
      
      expect (response.status).to.be.eq(200); // status code
      expect (response.headers['content-type']).to.be.eq('application/json; charset=utf-8')
    })
  })
  
  
  it('3 Get posts with id = 55 and id = 60. Verify HTTP response status code. Verify id values of returned records.', () => {
    let postsIds = {id1:55, id2:60}
    cy.log('**Getting posts by their id and checking that current ids present in response**')
    cy.request('GET',`/posts?id=${postsIds.id1}&id=${postsIds.id2}`).then(response => {
      expect (response.status).to.be.eq(200); // status code
      expect (response.body[0]['id']).to.be.eq(postsIds.id1)
      expect (response.body[1]['id']).to.be.eq(postsIds.id2)
      })
  })

  it('4 Create a post. Verify HTTP response status code.', () => {
    let smth = {} // можна без цього, це чисто перфекціонізм)
    cy.log('**Creating post by using wrong path and checking status code 401**')
    cy.request({method: 'POST', url: '/664/posts', smth, failOnStatusCode: false}).then(response => {
      expect (response.status).to.be.eq(401); // status code
     
      })
  })

  it(' 5 Create post with adding access token in header. Verify HTTP response status code. Verify post is created.', () => {

    let testUser = {
             email: faker.internet.email(),
             password: faker.internet.password()
             }
    cy.log('**Creating new user and taking it accessToken**')   
    cy.request('POST','/register',testUser).then(response => {
      expect (response.status).to.be.eq(201);
      let creationResponse = response.body
      cy.log('**Creating new post witn using accessToken**')
      cy.request({method: 'POST', url: '/664/posts', testUser, auth: { bearer: creationResponse.accessToken }}).then(response => {
        expect (response.status).to.be.eq(201); 
        let newCreatedPost = response.body['id']
        cy.get('When new post is created checking that arrey langht equal to new created post id')
        cy.request('GET','/posts').then(response => {
          expect (response.body.length).to.be.eq(newCreatedPost);  // проста перевірка але в даній логіці дієва
        })
    })
  })
  })

  it('6 Create post entity and verify that the entity is created. Verify HTTP response status code. Use JSON in body.', () => {
    let testBody = {userId: faker.internet.ip(),
                    title: faker.finance.bitcoinAddress(),
                    body: faker.animal.cat()
                   }
    cy.log('**Creating a new post and checking body response after creating with sended body for creating**')               
    cy.request({method:'POST',url:'/posts', body: testBody, headers: {"access_token" : 12345678 }}).then(response => {
      expect (response.status).to.be.eq(201); // status code
      expect(response.body['title']).to.be.eql(testBody.title)
  
    })
  })

  it('7 Update non-existing entity. Verify HTTP response status code.', () => {
    let testBody = {userId: faker.internet.ip(),
      title: faker.finance.bitcoinAddress(),
      body: faker.animal.cat()
     }
    cy.log('**Trying to update random non-existing post and checking status code 404**')
    cy.request({method: 'PUT', url: `/${faker.random.numeric(4)}/posts`, body:testBody, failOnStatusCode: false}).then(response => {
      expect (response.status).to.be.eq(404); // status code
      
     
      })
  })

  it('8 Create post entity and update the created entity. Verify HTTP response status code and verify that the entity is updated.', () => {
    let testBody = {userId: faker.internet.ip(),
      title: faker.finance.bitcoinAddress(),
      body: faker.animal.cat()
     }    
    cy.log('**Creating a new post with random values in body**')
    cy.request({method: 'POST', url: `/posts`, body:testBody}).then(response => {
      expect (response.status).to.be.eq(201); // status code
      let createReq = response.body
      testBody.body = faker.name.firstName()
      cy.log('**Updating the previoustly created post by PUT chanfing all values and checking that previust values are not equal to new one**')
      cy.request({method: 'PUT', url: `/posts/${response.body['id']}`, body:testBody}).then(response => {
        expect (response.status).to.be.eq(200);
        expect (response.body).to.be.not.eql(createReq)
        
      
      })
      })
  })


  it('9 Delete non-existing post entity. Verify HTTP response status code.', () => {
    cy.log('**Sending comand to delete non existing post and checking status code 404**')
    cy.request({method: 'DELETE', url: `posts/${faker.random.numeric(4)}`, failOnStatusCode: false}).then(response => {
      expect (response.status).to.be.eq(404); // status code
     
      })
  })

  it('10 Create post entity, update the created entity, and delete the entity. Verify HTTP response status code and verify that the entity is deleted', () => {

    let testBody = {userId: faker.internet.ip(),
      title: faker.finance.bitcoinAddress(),
      body: faker.animal.cat()
     }    
    cy.log('**Creating a new post and checking status code**')
    cy.request({method: 'POST', url: `/posts`, body:testBody}).then(response => { //creating
      expect (response.status).to.be.eq(201); // status code
      let createReq = response.body
      testBody.body = faker.name.firstName()
      cy.log('**Updating the created post**')
      cy.request({method: 'PUT', url: `/posts/${response.body['id']}`, body:testBody}).then(response => { //updating
        expect (response.status).to.be.eq(200);
        expect (response.body).to.be.not.eql(createReq)
        
        cy.log('**Deleting the created post**')
        cy.request({method: 'DELETE', url: `posts/${response.body['id']}`, failOnStatusCode: false}).then(response => { //deleting
          expect (response.status).to.be.eq(200); // status code
         })
         cy.log('**Checking that prevoustly created post is deleted by request to its id**')
         cy.request('GET',`/posts/?id=${response.body['id']}`).then(response => {
          expect (response.status).to.be.eq(200);
          expect(response.body).to.be.eql([])
        })
          
        

          
        
      
      })
      })
       
    
  })

  


  
  



