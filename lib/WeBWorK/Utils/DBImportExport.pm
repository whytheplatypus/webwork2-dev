################################################################################
# WeBWorK Online Homework Delivery System
# Copyright � 2000-2003 The WeBWorK Project, http://openwebwork.sf.net/
# $CVSHeader: webwork-modperl/lib/WeBWorK/Utils/CourseManagement.pm,v 1.2 2004/04/09 20:18:51 sh002i Exp $
# 
# This program is free software; you can redistribute it and/or modify it under
# the terms of either: (a) the GNU General Public License as published by the
# Free Software Foundation; either version 2, or (at your option) any later
# version, or (b) the "Artistic License" which comes with this package.
# 
# This program is distributed in the hope that it will be useful, but WITHOUT
# ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
# FOR A PARTICULAR PURPOSE.  See either the GNU General Public License or the
# Artistic License for more details.
################################################################################

package WeBWorK::Utils::DBImportExport;
use base qw(Exporter);

=head1 NAME

WeBWorK::Utils::DBImportExport - import and export the database.

=cut

use strict;
use warnings;
use Carp;
use Data::Dumper; $Data::Dumper::Indent = 1;
use XML::Parser;
use XML::Parser::EasyTree; $XML::Parser::EasyTree::Noempty = 1;
use XML::Writer;
use WeBWorK::Utils qw();

our @EXPORT    = ();
our @EXPORT_OK = qw(
	dbExport
	dbImport
);

our $DB_VERSION = "WWDBv2";

# table order is important
our @TABLE_ORDER = qw/user password permission key set problem set_user problem_user/;

# each subroutine should take a WeBWorK::DB object and return all records of a
# given type. these are tricky!
our %EXPORT_SUBS = (
	user         => sub { $_[0]->getUsers($_[0]->listUsers) },
	password     => sub { $_[0]->getPasswords($_[0]->listPasswords) },
	permission   => sub { $_[0]->getPermissionLevels($_[0]->listPermissionLevels) },
	key          => sub { $_[0]->getKeys($_[0]->listKeys) },
	set          => sub { $_[0]->getGlobalSets($_[0]->listGlobalSets) },
	problem      => sub { map { $_[0]->getAllGlobalProblems($_) } $_[0]->listGlobalSets },
	set_user     => sub { $_[0]->getUserSets( map { my $u=$_; map { [$u, $_] } $_[0]->listUserSets($u) } $_[0]->listUsers ) },
	problem_user => sub { map { my $u=$_; map { $_[0]->getAllUserProblems($u, $_) } $_[0]->listUserSets($u) } $_[0]->listUsers },
);

# each subroutine should take a WeBWorK::DB object and return a new, empty
# record object for a table.
our %NEW_SUBS = (
	user         => sub { $_[0]->newUser },
	password     => sub { $_[0]->newPassword },
	permission   => sub { $_[0]->newPermissionLevel },
	key          => sub { $_[0]->newKey },
	set          => sub { $_[0]->newGlobalSet },
	problem      => sub { $_[0]->newGlobalProblem },
	set_user     => sub { $_[0]->newUserSet },
	problem_user => sub { $_[0]->newUserProblem },
);

# each subroutine should take a WeBWorK::DB object and a subclass of 
# WeBWorK::DB::Record, and should add that record into a table in the given
# database.
our %ADD_SUBS = (
	user         => sub { $_[0]->addUser($_[1]) },
	password     => sub { $_[0]->addPassword($_[1]) },
	permission   => sub { $_[0]->addPermissionLevel($_[1]) },
	key          => sub { $_[0]->addKey($_[1]) },
	set          => sub { $_[0]->addGlobalSet($_[1]) },
	problem      => sub { $_[0]->addGlobalProblem($_[1]) },
	set_user     => sub { $_[0]->addUserSet($_[1]) },
	problem_user => sub { $_[0]->addUserProblem($_[1]) },
);

# each subroutine should take a WeBWorK::DB object and a subclass of 
# WeBWorK::DB::Record, and should put that record into a table in the given
# database.
our %PUT_SUBS = (
	user         => sub { $_[0]->putUser($_[1]) },
	password     => sub { $_[0]->putPassword($_[1]) },
	permission   => sub { $_[0]->putPermissionLevel($_[1]) },
	key          => sub { $_[0]->putKey($_[1]) },
	set          => sub { $_[0]->putGlobalSet($_[1]) },
	problem      => sub { $_[0]->putGlobalProblem($_[1]) },
	set_user     => sub { $_[0]->putUserSet($_[1]) },
	problem_user => sub { $_[0]->putUserProblem($_[1]) },
);

=head1 FUNCTIONS

=over

=item dbExport(%options)

Exports data from a WeBWorK database to a WWDBv2 XML document.

%options can contain:

=over

=item db

A WeBWorK::DB instance. Data will be exported from this database.

=item xml

A file handle, opened for writing. The XML output will we written to this file
handle.

=item tables

A reference to a list specifying the set of tables from which to export data.

=item records

Unimplemented.

=back

=cut

sub dbExport {
	my (%options) = @_;
	
	croak "options: 'xml' required.\n" unless exists $options{xml};
	croak "options: 'db' required.\n" unless exists $options{db};
	
	my @tables = exists $options{tables} ? @{$options{tables}} : ();
	@tables = @TABLE_ORDER unless @tables;
	my %tables;
	@tables{@tables} = ();
	
	my $writer = new XML::Writer(OUTPUT => $options{xml}, NEWLINES => 0, DATA_MODE => 1);
	
	$writer->startTag("webwork", version => $DB_VERSION);
	foreach my $table (@TABLE_ORDER) {
		next unless exists $tables{$table}; # skip unrequested tables
		$writer->startTag($table."s"); # plural
		
		my @Records = $EXPORT_SUBS{$table}->($options{db});
		foreach my $Record (@Records) {
			next unless $Record; # skip undefined records
			$writer->startTag($table);
			foreach my $field ($Record->FIELDS) {
				$writer->dataElement($field, $Record->$field);
			}
			$writer->endTag;
		}
		$writer->endTag;
	}
	$writer->endTag;
	
	$writer->end;
	
	return ();
}

=item dbImport(%options)

Imports the data from a WWDBv2 XML document into a WeBWorK database.

In this version, the entire XML parse tree is held in RAM during the import.
This can be very memory intensive for large import files.

%options can contain:

=over

=item xml

A string containing WWDBv2 XML data or a file handle opened for reading from a
WWDBv2 XML document.

=item db

A WeBWorK::DB instance. Imported data will be added to this database.

=item tables

A reference to a list specifying the set of tables from which to import data.

=item records

Unimplemented.

=item conflict

A string, containing either "skip" or "replace", indicating what to do with
duplicate records. If not set, duplicate records are skipped.

=back

=cut

sub dbImport {
	my (%options) = @_;
	
	croak "options: 'xml' required.\n" unless exists $options{xml};
	croak "options: 'db' required.\n" unless exists $options{db};
	
	my $replace = exists $options{conflict} && $options{conflict} eq "replace";
	
	my @tables = exists $options{tables} ? @{$options{tables}} : ();
	@tables = @TABLE_ORDER unless @tables;
	my %tables;
	@tables{@tables} = ();
	
	my ($parser, $tree);
	eval {
		$parser = new XML::Parser(Style => "EasyTree");
		$tree = $parser->parse($options{xml});
	};
	if ($@) {
		return "Failed to parse XML document: $@";
	}
	
	#warn "***** begin parse tree *****\n", Dumper($tree), "***** end parse tree *****\n";
	
	# find "webwork" node
	my ($root_element) = findNodes($tree, "e", "webwork");
	unless (defined $root_element) {
		return "Format error: <webwork> element not found.";
	}
	
	# verify version
	unless (exists $root_element->{attrib}->{version}) {
		return "Version mismatch: XML document has no version attribute.";
	}
	unless ($root_element->{attrib}->{version} eq $DB_VERSION) {
		return "Version mismatch: XML document has version \""
			. $root_element->{attrib}->{version} . "\" (expected $DB_VERSION).";
	}
	
	my @nonfatal_errors;
	
	TABLE: foreach my $table (@TABLE_ORDER) {
		next TABLE unless exists $tables{$table}; # skip unrequested tables
		
		my ($table_element) = findNodes($root_element->{content}, "e", $table."s");
		unless ($table_element) {
			push @nonfatal_errors, "Format error: <${table}s> element not found.";
			next TABLE;
		}
		
		my $add_sub = $ADD_SUBS{$table};
		my $put_sub = $PUT_SUBS{$table};
		
		my @record_elements = findNodes($table_element->{content}, "e", $table);
		foreach my $record_element (@record_elements) {
			my $Record = $NEW_SUBS{$table}->($options{db});
			element2record($record_element, $Record);
			#warn "***** begin @{[ref $Record]} record *****\n", $Record->toString, "***** end @{[ref $Record]} record *****\n";
			#warn ref $Record, " => ", $Record->idsToString, "\n";
			
			eval { $options{db}->$add_sub($Record) };
			if ($@) {
				if ($@ =~ m/exists/) {
					if ($replace) {
						eval { $options{db}->$put_sub($Record) };
						if ($@) {
							push @nonfatal_errors, "$table record with @{[$Record->idsToString]} exists, failed to replace: $@";
						}
					} else {
						push @nonfatal_errors, "$table record with @{[$Record->idsToString]} exists, skipping";
					}
				} else {
					push @nonfatal_errors, "$table record with @{[$Record->idsToString]}: $@";
				}
			}
		}
	}
	
	return @nonfatal_errors;
}

sub findNodes {
	my ($tree, $type, $name) = @_;
	my @found;
	foreach my $node (@$tree) {
		if ((not defined $type or $node->{type} eq $type)
				and (not defined $name or $node->{name} eq $name)) {
			push @found, $node;
		}
	}
	return @found;
}

sub element2record {
	my ($element, $Record) = @_;
	my %fields;
	@fields{$Record->FIELDS} = ();
	
	foreach my $field_element (@{$element->{content}}) {
		my $type = $field_element->{type};
		my $name = $field_element->{name};
		unless ($type eq "e") {
			warn "found unexpected node of type '$type', ignoring.\n";
			next;
		}
		unless (exists $fields{$name}) {
			warn "found unexpected element with name '$name', ignoring.\n";
			next;
		}
		if ($fields{$name}) {
			warn "found duplicate element with name '$name', ignoring.\n";
			next;
		}
		
		$fields{$name}++;
		my ($content_node) = findNodes($field_element->{content}, "t", undef);
		unless ($content_node) {
			#warn "field element '$name' has no content, ignoring.\n";
			next;
		}
		$Record->$name($content_node->{content});
	}
	return $Record;
}

=back

=but

1;