export default class ApplicationStep {

	// the outline trace stage: draw the border of the plan
	static get TRACE_OUTLINE()		{ return 1; }

	// add specialEasements & crossovers to the outline
	static get ADD_EASEMENT()		{ return 2; }

	// import the floor plan layers
	static get IMPORT_FLOOR_PLAN()	{ return 3; }

	// apply transformations and add extensions to the floor
	static get ADD_EXTENSIONS()		{ return 4; }

	// add measurement points that are linked to the floor plan and outline path; }
	static get ADD_MEASUREMENTS()	{ return 5; }

	// PDF export / save step
	static get EXPORT_PDF()			{ return 6; }

	static get TOTAL_STEPS()		{ return 7; }
}