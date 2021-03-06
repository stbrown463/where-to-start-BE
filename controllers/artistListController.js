const express 	 = require ('express')
const router		 = express.Router()
const ArtistList = require('../models/artistList')
const Artist 		 = require('../models/artist')
const User 			 = require('../models/user')

const API_KEY = process.env.LASTFM_API_KEY

// View User's Lists
router.post('/', async (req, res) => {
	try {
		const foundLists = await ArtistList.find({userId: req.body.userId}) // {userId: req.session.userId}
		//const foundUser = await User.findById({})

		res.json({
      status: 200,
      data: foundLists
    });
	} catch (err) {
		console.log(err)
	}
})

// Create a new list
router.post('/new', async (req, res) => {
	try {

		const createdList = await ArtistList.create(req.body);
		const foundUser = await User.findById(req.body.userId);

		foundUser.artistLists.push(createdList)
		await foundUser.save()



		res.json({
      status: 200,
      data: createdList
    });
	} catch (err) {
		console.log(err)
	}
})

// Delete a List
router.delete('/:listId', async (req, res) => {
	try {

		// delete List by id
		const deletedList = await ArtistList.findByIdAndRemove(req.params.listId)

		// Find user who made deletedList
		const foundUser = await User.findById(deletedList.userId)
		
		// splice the deleted list from the user's list array
		const indexOfList = foundUser.artistLists.findIndex((list) => list._id === deletedList._id)
		foundUser.artistLists.splice(indexOfList, 1)
		await foundUser.save()

		res.json({
			status: 200,
			data: deletedList
		})
	} catch (err) {
		console.log(err)
	}
})

// Add Artist to a List
router.put('/:listId', async (req, res) => {
	try {		
		// find list it's being added to
		const foundList = await ArtistList.findOne({ _id: req.params.listId })
		const foundUser = await User.findById(foundList.userId)
			
		// search db for artist by that id
		const foundArtist = await Artist.findOne({mbid: req.body.mbid})

		// if foundList already has artist of artist.name, don't add

			// if artists doesn't exist yet, create artist,
		if (!foundArtist) {
			const createdArtist = await Artist.create(req.body) //or something like that

				// push artist into that list
				foundList.artists.push(createdArtist)
				await foundList.save()

				// delete old list from users list array
				const indexOfList = foundUser.artistLists.findIndex((list) => list._id === foundList._id)
				foundUser.artistLists.splice(indexOfList, 1)
				await foundUser.save()

				// push in updated list into users list array
				foundUser.artistLists.push(foundList)
				await foundUser.save()


				//send response
				res.json({
					status: 200,
					data: foundList
				})

		} else {
			// check for duplicates
			const artistAlreadyInList = foundList.artists.find((artist) => artist.mbid === foundArtist.mbid)
			if (artistAlreadyInList) {
				res.json({
					status: 200,
					data: foundList
				})
			} else {
				// push artist into list if no duplicates found
				foundList.artists.push(foundArtist)
				await foundList.save()

				// delete old list from users list array
				const indexOfList = foundUser.artistLists.findIndex((list) => list._id === foundList._id)
				foundUser.artistLists.splice(indexOfList, 1)
				await foundUser.save()

				// push in updated list into users list array
				foundUser.artistLists.push(foundList)
				await foundUser.save()

				res.json({
					status: 200,
					data: foundList
				})
			}
		}
	} catch (err) {
		console.log(err)
	}
})

// Delete Artist from a list
router.put('/:listId/:artistId/delete', async (req, res) => {
	try {
		// Search DB for list Id
		const foundList = await ArtistList.findOne({ _id: req.params.listId })
		const foundUser = await User.findById(foundList.userId)

		// Find Artist by mbid in list's artist array
		const indexOfArtist = foundList.artists.findIndex(artist => artist.mbid === req.params.artistId)

		// splice Artist from that list 
		foundList.artists.splice(indexOfArtist, 1)

		await foundList.save()

		// delete old list from users list array
		const indexOfList = foundUser.artistLists.findIndex((list) => list._id === foundList._id)
		foundUser.artistLists.splice(indexOfList, 1)
		await foundUser.save()

		// push in updated list into users list array
		foundUser.artistLists.push(foundList)
		await foundUser.save()

		// return updated list
		res.json({
			status: 200,
			data: foundList
		})
	} catch (err) {
		console.log(err)
	}
})


// Change Name of List
router.put('/:listId', async (req, res) => {
	try {
		const updatedList = await ArtistList.findByIdAndUpdate(req.params.listId, req.body, {new: true})
		res.json({
			status: 200,
			data: updatedList
		})
	} catch (err) {
		console.log(err)
	}
})






module.exports = router;