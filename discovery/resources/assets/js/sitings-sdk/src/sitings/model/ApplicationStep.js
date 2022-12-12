export default class ApplicationStep {

	// the outline trace stage: draw the border of the plan
	static get TRACE_OUTLINE()		{ return 2; }

	// add specialEasements & crossovers to the outline
	static get ADD_EASEMENT()		{ return 3; }

	// import the floor plan layers
	static get IMPORT_FLOOR_PLAN()	{ return 4; }

	// apply transformations and add extensions to the floor
	static get ADD_EXTENSIONS()		{ return 5; }

	// add measurement points that are linked to the floor plan and outline path; }
	static get ADD_MEASUREMENTS()	{ return 6; }

	// PDF export / save step
	static get EXPORT_PDF()			{ return 7; }


	static get TOTAL_STEPS()		{ return 8; }
}