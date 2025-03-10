import React, { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { MdEdit } from "react-icons/md"
import { GoVerified, GoX } from "react-icons/go"
import { IconContext } from "react-icons"
import { displayAlert, loadOptions } from "../actions/misc"
import { emailVerifyRequest, updateProfile, removeDp } from "../actions/user"
import {
	Alert,
	FormSelect,
	Bar,
	SaveChanges,
	ImageUpload,
	Popup,
	ChangePswForm,
} from "../components"
import { IMAGE_URL } from "../urls"

function Profile() {
	//load states from redux store
	const misc = useSelector(state => state.misc)
	const user = useSelector(state => state.auth.user)

	//component level states
	const initState = {
		changed: false,
		bio: "",
		preview: "",
		preview2: "",
		ageL: "",
		ageH: "",
		passion: [],
	}
	const [settings, setSettings] = useState(initState)
	const [flags, setFlags] = useState({ changePS: false, editBio: false })

	//component level dispatcher
	const dispatch = useDispatch()

	//useEffect hooks
	useEffect(() => {
		if (user.images)
			setSettings(prev => ({
				...prev,
				preview: user.images[0]
					? IMAGE_URL + user.images[0]
					: "https://via.placeholder.com/300/000000/FFFFFF/?text=Upload+a+Profile+Picture",
				ageH: user.preference.age[1],
				ageL: user.preference.age[0],
				passion: user.passion,
			}))
		dispatch(loadOptions())
	}, [user])

	//event handlers
	const onChange = e => {
		if (!settings.changed) setSettings({ ...settings, changed: true })
		if (e.target.name == "ageL" && e.target.value > settings.ageH) {
			setSettings({ ...settings, ageH: parseInt(e.target.value) + 1 })
		}
		if (e.target.name == "ageH" && e.target.value < settings.ageL) {
			setSettings({ ...settings, ageL: parseInt(e.target.value) - 1 })
		}
		if (e.target.type === "file") {
			let file = e.target.files[0]
			if (e.target.name == "upload1") {
				setSettings(prev => ({
					...prev,
					isDP: true,
					preview: URL.createObjectURL(file),
					file: file,
				}))
			} else {
				setSettings(prev => ({
					...prev,
					preview2: URL.createObjectURL(file),
					file: file,
				}))
			}
		}
		if (e.target.name == "passion") {
			setSettings(prev => ({
				...prev,
				passion: [...settings.passion, e.target.value],
			}))
		} else {
			let field_name = e.target.name
			let field_value = e.target.value
			setSettings(prev => ({ ...prev, [field_name]: field_value }))
		}
	}
	const verifyMail = () => {
		dispatch(emailVerifyRequest())
	}
	const onSubmit = e => {
		e.preventDefault()
		setSettings(initState)
		setFlags({ changePS: false, editBio: false })
		dispatch(updateProfile(settings))
	}
	const delPassion = passion => {
		if (!settings.changed) setSettings({ ...settings, changed: true })
		setSettings(prev => ({
			...prev,
			passion: settings.passion.filter(pas => pas != passion),
		}))
	}
	const removePic = (e, name, image = "") => {
		switch (name) {
			case "dp": {
				setSettings({
					...settings,
					isDP: false,
					file: null,
					preview: `${IMAGE_URL}/${user.images[0]}`,
				})
				break
			}
			case "images": {
				dispatch(removeDp(image))
				break
			}
			case "uploadPic": {
				setSettings({
					...settings,
					file: null,
					preview2: "",
				})
				break
			}
			default: {
			}
		}
	}
	const handlePopupClose = e => {
		setFlags({ ...flags, changePS: false })
	}
	return (
		<>
			<Bar title={"Settings"} />
			{misc.showAlert && <Alert />}
			<div className="container mx-auto md:w-full">
				<form
					encType="multipart/form-data"
					onChange={onChange}
					onSubmit={onSubmit}
				>
					<div className="flex flex-wrap pb-4 -ml-7 container">
						<aside className="w-full md:w-1/4  px-2  h-full float-left">
							<div className="grid justify-items-center left-1 lg:fixed md:fixed md:w-[24vw] sm:w-full sm:content-center border-2 border-green-700 rounded-xl p-2 profile-form">
								<h5>Profile Picture</h5>
								<div className="flex border-2 rounded-xl border-amber-900 h-56 w-56">
									{!settings.preview2 && (
										<>
											{settings.isDP && (
												<span
													className="absolute mt-4 ml-2 w-4 h-4 bg-black text-white cursor-pointer"
													name="dp"
													onClick={e =>
														removePic(e, "dp")
													}
												>
													<GoX name="dp" />
												</span>
											)}
											{!settings.isDP && (
												<label
													className="change-pic cursor-pointer"
													htmlFor="upload"
												>
													<MdEdit />
												</label>
											)}
										</>
									)}
									<img
										className="h-56 w-56 rounded-xl"
										src={settings.preview}
										alt={user.firstName}
									/>
									<input
										id="upload"
										type="file"
										accept="image/*"
										name="upload1"
									/>
								</div>
								<ul className="sm:text-center permanent-info m-2">
									<li className="capitalize">
										{user.firstName + " " + user.lastName}
										{user.email_verified && (
											<GoVerified className="inline ml-2" />
										)}
									</li>

									<li>{user.dob}</li>
									<li className="capitalize">
										{user.gender}
									</li>
									<li className="text-ellipsis">
										{user.email}
									</li>
									<li>
										{user.email_verified ? (
											<span className="text-green-700">
												Email Verified
											</span>
										) : (
											<span
												className="text-yellow-900 cursor-pointer bg-slate-200"
												onClick={verifyMail}
											>
												Verify email
											</span>
										)}
									</li>
									<li
										className="text-red-500 text-bold cursor-pointer"
										onClick={e => {
											setFlags({
												...flags,
												changePS: true,
											})
										}}
									>
										Change password
									</li>
								</ul>
							</div>
						</aside>
						<main
							role="main"
							className="w-full md:w-3/4 pt-1 px-2 border-4 rounded-xl"
						>
							<h5 className="m-3">Your details</h5>
							<div className="grid sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3  border-b-2 border-b-green-700 pb-4 px-6">
								{user.images &&
									user.images.slice(1).map(image => {
										return (
											<div
												key={image}
												className="border-2 w-fit rounded-xl border-amber-900 h-60 w-60 my-1"
											>
												<span
													className="absolute mt-4 ml-2 w-4 h-4 bg-black text-white"
													onClick={e =>
														removePic(
															e,
															"images",
															image
														)
													}
												>
													<GoX />
												</span>
												<img
													className="h-60 w-60 rounded-xl"
													src={IMAGE_URL + image}
												/>
											</div>
										)
									})}
								{user.images && user.images.length < 4 && (
									<ImageUpload
										onChange={onChange}
										settings={settings}
										user={user}
										removePic={removePic}
									/>
								)}
							</div>
							<label
								htmlFor="bio"
								className="mt-4 mx-10 form-label font-bold text-lg"
							>
								Bio{" "}
								<span
									className="inline-block hover:text-red-500 cursor-pointer"
									onClick={e => {
										setFlags(
											{ ...flags, editBio: true },
											setSettings({
												...settings,
												bio: user.bio,
											})
										)
									}}
								>
									<MdEdit />
								</span>
							</label>

							<Popup
								close={e => {
									setFlags({ ...flags, editBio: false })
								}}
								clicked={flags.editBio}
							>
								<div className="grid grid-row-2 flex justify-center">
									<h4 className="text-center">Edit Bio</h4>
									<textarea
										type="text"
										name="bio"
										cols={"40"}
										className="block h-32 w-[96] mb-1 text-orange-700 font-bold resize-none p-4 border-2 border-slate-600 rounded-lg"
										placeholder={user.bio}
										value={settings.bio}
										onChange={onChange}
									/>
								</div>
							</Popup>

							<p className="mt-12 font-bold text-orange-700 pb-4">
								{user.bio}
							</p>

							<div className="grid grid-cols-2 gap-5 px-1 mx-10">
								<div className="grid grid-row-2">
									<label
										htmlFor="gender"
										className="form-label"
									>
										University
									</label>
									<FormSelect
										defaultV={user.university}
										name="university"
										options={misc.options.universities?.filter(_=>_!="Any")}
									/>
								</div>
								<div className="grid grid-row-2">
									<label htmlFor="age" className="form-label">
										Program
									</label>
									<FormSelect
										name="program"
										defaultV={user.program}
										options={misc.options.programs?.filter(_=>_!="Any")}
									/>
								</div>
							</div>
							<div className="ml-10 py-4">Passions</div>
							<div className="flex flex-wrap mx-7">
								{settings.passion &&
									settings.passion.map((passion, index) => (
										<div key={index}>
											<span
												className="mx-2 mb-4 p-2 cursor-pointer rounded-lg bg-green-600 text-white"
												key={index}
											>
												{passion}
												<span
													onClick={e =>
														delPassion(passion)
													}
													className="absolute float-right -mt-1 -ml-1 leading-3 text-red-100 bg-red-900 h-3 px-1 rounded-full"
												>
													x
												</span>
											</span>
										</div>
									))}
								<FormSelect
									name="passion"
									hint="Add passion"
									options={misc.options.passions}
								/>
							</div>
							<h4 className="m-5">You are looking for</h4>
							<div className="grid grid-cols-2 gap-5 px-1 mx-10">
								<div className="grid grid-row-2">
									<label
										htmlFor="gender"
										className="form-label"
									>
										University
									</label>
									<FormSelect
										defaultV={
											user.preference
												? user.preference.university
												: ""
										}
										name="universityPreference"
										options={misc.options.universities}
									/>
								</div>
								<div className="grid grid-row-2">
									<label htmlFor="age" className="form-label">
										Program
									</label>
									<FormSelect
										name="programPreference"
										defaultV={
											user.preference
												? user.preference.program
												: ""
										}
										options={misc.options.programs}
									/>
								</div>
								<div className="grid grid-row-2">
									<label
										htmlFor="gender"
										className="form-label"
									>
										Gender
									</label>
									<FormSelect
										defaultV={
											user.preference
												? user.preference.gender
												: ""
										}
										name="genderPreference"
										options={["male", "female", "other"]}
									/>
								</div>
								<div className="grid grid-row-3 pb-8">
									<label htmlFor="age" className="form-label">
										Age Range
									</label>
									<div className="grid mx-auto place-items-center slider-values">
										{settings.ageL} - {settings.ageH} years
									</div>
									<div className="slider-container">
										<div className="slider-track"></div>
										<input
											type="range"
											id="agePref"
											name="ageL"
											min="18"
											max="50"
											value={settings.ageL}
											onChange={onChange}
										/>

										<input
											type="range"
											id="agePref"
											name="ageH"
											min="18"
											max="50"
											value={settings.ageH}
											onChange={onChange}
										/>
									</div>
								</div>
							</div>
						</main>
					</div>
					{settings.changed && <SaveChanges />}
				</form>
			</div>
			<Popup
				close={e => {
					setFlags({ ...flags, changePS: false })
				}}
				clicked={flags.changePS}
			>
				<ChangePswForm
					handlePopupClose={e => {
						setFlags({ ...flags, changePS: false })
					}}
				/>
			</Popup>
		</>
	)
}

export default Profile
