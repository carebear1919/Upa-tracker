-- Reset the reminder message to the default Template for existing installs.
-- The 0001 column default only applies to NEW rows, so old settings rows
-- still carried older wording. Flip any row that still matches a previous
-- version of the template back to the current default.
update settings
set reminder_template = 'Hello, remind ko lang sana ung due payment mo na {amount} this {month} {due_day} salamat!'
where lower(reminder_template) like '%this is a reminder%'
   or lower(reminder_template) like '%your rent of%'
   or lower(reminder_template) like '%due on day%'
   or lower(reminder_template) like '%this day%'
   or lower(reminder_template) like '%remind ko lang%';