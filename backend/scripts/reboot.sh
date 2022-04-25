#!/usr/bin/expect -f
set IPAddress [lindex $argv 0]
set Username [lindex $argv 1]
set Password [lindex $argv 2]
set PortNo [lindex $argv 3]

set timeout 10

spawn ssh -o KexAlgorithms=+diffie-hellman-group1-sha1 -o HostKeyAlgorithms=ssh-dss $Username@$IPAddress
expect "*: "
send "$Password\r"
expect "*" {send "configure terminal\r"}
expect "*" {send "interface GE$PortNo\r"}
expect "*" {send "power inline never\r"}
expect "*" {send "power inline auto\r"}
expect "*" {send "exit\r"}
expect "*" {send "exit\r"}
expect "*" {send "exit\r"}
interact
