DEFINE TABLE marker__note SCHEMAFULL
	PERMISSIONS
		FOR select, create WHERE $auth != NONE AND $auth.enabled = true,
		FOR update, delete WHERE $auth != NONE AND $auth.enabled = true AND marker__by = $auth.id
	COMMENT 'notes kept by the marker pack';

DEFINE FIELD marker__body ON marker__note TYPE string
	ASSERT string::len($value) > 0 AND string::len($value) <= 500
	PERMISSIONS FULL
	COMMENT 'the note text';

DEFINE FIELD marker__by ON marker__note TYPE record<user>
	VALUE $before ?? $auth.id
	READONLY
	PERMISSIONS FOR select FULL FOR create WHERE $value = $auth.id FOR update NONE
	COMMENT 'the signed-in user who created the note';

DEFINE FIELD marker__at ON marker__note TYPE datetime
	VALUE $before OR time::now()
	READONLY
	PERMISSIONS FULL
	COMMENT 'when the note was created';

DEFINE FUNCTION fn::marker__note($args: object) {
	RETURN "marker-pack-returned";
} COMMENT 'note for the marker pack';
