use strict;
use warnings;
use FileHandle;

my $db_buffer = "";
my $fh = new FileHandle "db.js" or die;
while ( my $line = <$fh> ){
	$db_buffer .= $line;	
}
close $fh;

my $tp_buffer = "";
my $fh2 = new FileHandle "schemas/types.js" or die;
while ( my $line = <$fh2> ){
	$tp_buffer .= $line;	
}
close $fh2;

my $qr_buffer = "";
my $fh3 = new FileHandle "schemas/queries.js" or die;
while ( my $line = <$fh3> ){
	$qr_buffer .= $line;	
}
close $fh3;

my $relations_code = "";
my $exports_code = "";
my $associations_code = "";
my $types_code = "";
my $types_exports_code = "";
my $query_code = "";
my $query_imports_code = "";

$db_buffer =~ s/(?<=\/\/start relations\n\n).*(?=\n\/\/end relations)/$relations_code/sg;
$db_buffer =~ s/(?<=\/\/start exports\n\n).*(?=\n\/\/end exports)/$exports_code/sg;
$db_buffer =~ s/(?<=\/\/start associations\n\n).*(?=\n\/\/end associations)/$associations_code/sg;
$tp_buffer =~ s/(?<=\/\/start types\n\n).*(?=\n\/\/end types)/$types_code/sg;
$tp_buffer =~ s/(?<=\/\/start exports\n\n).*(?=\n\/\/end exports)/$types_exports_code/sg;
$qr_buffer =~ s/(?<=\/\/start queries\n\n).*(?=\n\/\/end queries)/$query_code/sg;
$qr_buffer =~ s/(?<=\/\/start imports\n\n).*(?=\n\/\/end imports)/$query_imports_code/sg;

my $fh_write = new FileHandle ">db.js" or die;
print $fh_write $db_buffer;

my $tp_write = new FileHandle ">schemas/types.js" or die;
print $tp_write $tp_buffer;

my $qr_write = new FileHandle ">schemas/queries.js" or die;
print $qr_write $qr_buffer;
