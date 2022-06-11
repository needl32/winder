const { messagesModel, relationModel } = require("../Models/relationModel")

const getConvoList = async (req, res) => {
	try {
		const convoList = await relationModel.find(
			{ users: req.userdata._id, stat: 0 },
			{ users: 1, stat: 1, unreadCount: 1, _id: 0 }
		)
		res.json({ success: true, data: convoList })
	} catch (err) {
		res.status(500).json({ success: false, error: "Internal Server Error" })
	}
}

const getMessages = async (req, res) => {
	const { id } = req.params
	var { cursor } = req.query

	if (cursor) {
		cursor = new Date(cursor)
		if (!(cursor instanceof Date && !isNaN(cursor)))
			return res
				.status(400)
				.json({ success: false, error: "Invalid cursor." })
	}

	const paginationMatch = cursor ? { createdAt: { $lte: cursor } } : {}

	try {
		var relation = await relationModel
			.findOne(
				{ users: { $all: [req.userdata._id, id] }, stat: 0 },
				{ messages: 1 }
			)
			.populate({
				path: "messages",
				select: ["content", "sender", "createdAt"],
				match: paginationMatch,
				options: { limit: 11, sort: { createdAt: -1 } },
			})
		const more = relation.messages.length === 11
		const nextCursor = more
			? relation.messages[10].createdAt
			: undefined
		more && relation.messages.pop()

		res.json({ success: true, nextCursor, data: relation.messages })
	} catch (err) {
		console.log(err)
		res.status(500).json({ success: false, error: "Internal Server Error" })
	}
}

const sendMessage = async (req, res) => {
	const { id } = req.params
	const { content } = req.body
	try {
		var relation = await relationModel.findOne({
			users: { $all: [req.userdata._id, id] },
			stat: 0,
		})
		const sender = relation.users[1] === req.userdata._id
		const msg = new messagesModel({ content, sender })
		await msg.save()
		relation.messages.push(msg._id)
		await relation.save()
		res.json({ success: true, id: msg._id })
	} catch (err) {
		console.log(err.message)
		res.status(500).json({ success: false, error: "Internal Server Error" })
	}
}

module.exports = { getConvoList, getMessages, sendMessage }
